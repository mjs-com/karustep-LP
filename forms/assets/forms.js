import { initializeMeasurement } from './google-measurement.js';
import { emit, attribution } from './measurement.js';

const type = document.body.dataset.formType;
const isComplete = document.body.dataset.page === 'complete';
const status = document.querySelector('#status');
const storageKey = `ks.receipt.${type}`;
let config;
const memory = {};
function setStatus(message, isError = false) {
  status.textContent = message; status.hidden = !message;
  status.classList.toggle('is-error', isError);
  status.setAttribute('role', isError ? 'alert' : 'status');
  if (isError) { status.tabIndex = -1; status.focus(); }
}
function write(key, data) { memory[key] = data; try { sessionStorage.setItem(key, JSON.stringify(data)); return true; } catch { return false; } }
function read(key) { try { return memory[key] || JSON.parse(sessionStorage.getItem(key) || 'null'); } catch { return memory[key]; } }
async function api(path, body) {
  const response = await fetch(config.apiBase + path, { method: body ? 'POST' : 'GET', headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined, cache: 'no-store', signal: AbortSignal.timeout(30000) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.message || (response.status === 429 ? '送信が続いています。少し時間をおいてお試しください。' : '受付に接続できませんでした。時間をおいて再度お試しください。')), { data });
  return data;
}
function showPreview(enabled) { document.querySelector('#preview-notice').hidden = !enabled; }
async function complete() {
  const pending = read(storageKey);
  if (!pending?.proof) { document.querySelector('#unverified').hidden = false; return; }
  const result = await api('/receipt', { proof: pending.proof });
  if (!result.saved || result.formType !== type) throw new Error('この受付を確認できませんでした。');
  showPreview(result.preview);
  document.querySelector('#verified').hidden = false;
  document.querySelector('#receipt-id').textContent = result.receiptId;
  const copyMessages = {
    not_requested: '入力内容のコピーは送信しません。',
    preview_saved: '入力内容のコピーを送信する設定です。プレビューのため実際のメールは送信していません。',
    sent: '連絡先のメールアドレスへ、入力内容のコピーを送信しました。',
    pending: '受付は完了しています。入力内容のコピーのメール送信を確認しています。'
  };
  const copyStatus = document.querySelector('#copy-status');
  if (copyStatus && copyMessages[result.copyStatus]) { copyStatus.textContent = copyMessages[result.copyStatus]; copyStatus.hidden = false; }
  if (!pending.measured) {
    // This is a local dataLayer hook. Vendor transport is deliberately not configured yet.
    emit('karustep_form_saved', { ...pending.context, form_type: type, form_id: `karustep_${type}` });
    write(storageKey, { ...pending, measured: true });
  }
}
async function setupForm() {
  const form = document.querySelector('form'); const review = document.querySelector('#review');
  const submit = document.querySelector('#send'); const openReview = form.querySelector('[type=submit]');
  function clearFieldError(control) {
    control.removeAttribute('aria-invalid');
    control.removeAttribute('aria-errormessage');
    control.closest('[data-field]')?.querySelector('.field-error')?.remove();
  }
  form.addEventListener('input', event => { if (event.target.matches('input,select,textarea')) clearFieldError(event.target); });
  function showFieldErrors(errors) {
    for (const [name, message] of Object.entries(errors)) {
      const control = form.elements.namedItem(name);
      if (!(control instanceof HTMLElement)) continue;
      clearFieldError(control);
      const field = control.closest('[data-field]');
      if (!field) continue;
      const note = document.createElement('p');
      note.className = 'field-error'; note.id = `${name}-error`; note.textContent = message;
      control.setAttribute('aria-invalid', 'true'); control.setAttribute('aria-errormessage', note.id);
      field.append(note);
    }
  }
  const otherSource = form.querySelector('[name=sourceOther]');
  if (otherSource) {
    const source = form.querySelector('[name=source]');
    const updateOther = () => { otherSource.closest('[data-field]').hidden = source.value !== 'その他'; if (source.value !== 'その他') otherSource.value = ''; };
    source.addEventListener('change', updateOther); updateOther();
  }
  const setStep = step => document.querySelectorAll('.steps li').forEach((el, i) => { el.classList.toggle('active', i + 1 === step); if (i + 1 === step) el.setAttribute('aria-current', 'step'); else el.removeAttribute('aria-current'); });
  // Fragments carry non-identifying acquisition across target=_blank; do not copy UTM onto internal query strings.
  const fragment = new URLSearchParams(location.hash.slice(1));
  const url = new URL(location.href);
  for (const [key, value] of fragment) if (/^(utm_(source|medium|campaign|content|term)|gclid|gbraid|wbraid)$/.test(key)) url.searchParams.set(key, value);
  if (fragment.size) {
    let incoming = {};
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid']) {
      const value = fragment.get(key); if (value && value.length <= 200 && /^[a-zA-Z0-9_./~+\-=:%]+$/.test(value)) incoming[key] = value;
    }
    try { sessionStorage.setItem('ks.acquisition', JSON.stringify(incoming)); } catch { /* Optional. */ }
    history.replaceState(null, '', location.pathname + location.search);
  }
  const context = attribution();
  emit('karustep_form_view', { ...context, form_type: type, form_id: form.id });
  let began = false;
  form.addEventListener('input', () => { if (!began) { began = true; emit('karustep_form_begin', { ...context, form_type: type, form_id: form.id }); } });
  let ticket;
  async function session() {
    document.querySelector('#retry-connection').hidden = true;
    openReview.disabled = true;
    try { ticket = await api(`/session/${type}`); showPreview(ticket.preview); openReview.disabled = false; setStatus(''); }
    catch (error) { setStatus(error.message, true); document.querySelector('#retry-connection').hidden = false; }
  }
  document.querySelector('#retry-connection').addEventListener('click', session);
  function submissionData() {
    const fields = Object.fromEntries(new FormData(form));
    form.querySelectorAll('input[type=checkbox]').forEach(c => { fields[c.name] = c.checked ? c.value : ''; });
    const copy = document.querySelector('[name=sendCopy]');
    fields.sendCopy = copy?.checked ? '送信する' : '';
    const website = String(fields.website || ''); delete fields.website;
    return { fields, website };
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity() || !ticket) return;
    if (openReview.disabled) return;
    openReview.disabled = true;
    const originalLabel = openReview.innerHTML;
    openReview.textContent = '入力内容を確認しています…';
    try {
      // Use the exact same server validation before review and before persistence.
      // A failed precheck never saves a submission or creates a completion event.
      await api(`/validate/${type}`, { token: ticket.token, ...submissionData() });
    } catch (error) {
      if (error.data?.errors) showFieldErrors(error.data.errors);
      setStatus(error.data?.message || '入力内容を確認できませんでした。もう一度お試しください。', true);
      return;
    } finally {
      openReview.disabled = false; openReview.innerHTML = originalLabel;
    }
    const summary = document.querySelector('#review-values'); summary.replaceChildren();
    form.querySelectorAll('[data-field]').forEach(field => {
      if (field.hidden) return;
      const control = field.querySelector('input,select,textarea');
      const label = field.querySelector('[data-label]').textContent;
      const value = control.name === 'sendCopy' ? (control.checked ? 'コピーを送信する' : 'コピーを送信しない')
        : control.type === 'checkbox' ? (control.checked ? control.value : '選択なし') : control.value;
      const dt = document.createElement('dt'); dt.textContent = label;
      const dd = document.createElement('dd'); dd.textContent = value || '入力なし';
      summary.append(dt, dd);
    });
    form.hidden = true; review.hidden = false; setStep(2); setStatus(''); review.querySelector('h2').focus(); review.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  document.querySelector('#back').addEventListener('click', () => { review.hidden = true; form.hidden = false; setStep(1); form.querySelector('input').focus(); });
  submit.addEventListener('click', async () => {
    if (submit.disabled) return;
    submit.disabled = true; document.querySelector('#back').disabled = true; submit.textContent = '送信しています…'; setStatus('');
    try {
      const { fields, website } = submissionData();
      emit('karustep_form_submit_attempt', { ...context, form_type: type, form_id: form.id });
      const saved = await api(`/submit/${type}`, { token: ticket.token, fields, attribution: context, website });
      const persisted = write(storageKey, { proof: saved.proof, context, measured: false });
      // No submitted fields are persisted to browser storage or placed in the URL.
      if (persisted) location.assign(saved.completeUrl);
      else {
        // Private browsing can disable storage. Keep proof in memory and still show the saved receipt.
        document.querySelector('#form-workflow').hidden = true;
        document.querySelector('#complete-workflow').hidden = false;
        history.replaceState(null, '', saved.completeUrl);
        await complete();
      }
    } catch (error) {
      emit('karustep_form_error', { ...context, form_type: type, error_type: error.data?.errors ? 'validation' : 'save_failed' });
      if (error.data?.errors) {
        review.hidden = true; form.hidden = false; setStep(1); showFieldErrors(error.data.errors);
      }
      setStatus(error.data?.message || '送信を完了できませんでした。入力内容は残っていますので、もう一度お試しください。', true);
      if (error.data?.errors) form.elements.namedItem(Object.keys(error.data.errors)[0])?.focus();
      submit.disabled = false; document.querySelector('#back').disabled = false; submit.textContent = 'この内容で送信する';
    }
  });
  await session();
}
try {
  const response = await fetch('/karustep-LP/forms/assets/config.json', { cache: 'no-store' });
  config = await response.json();
  // Optional analytics must never prevent a customer from submitting the form.
  try { initializeMeasurement(config); } catch { /* Keep the form usable. */ }
  await (isComplete ? complete() : setupForm());
} catch (error) { setStatus(isComplete ? '受付状況を確認できませんでした。再送信せず、時間をおいてこの画面を更新してください。' : error.message, true); }
