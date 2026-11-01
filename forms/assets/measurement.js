// No vendor script is loaded here. Enable transport only after reviewing the issued tags.
export function emit(event, context = {}) {
  const allowed = ['form_type', 'form_id', 'entry_page_key', 'cta_placement', 'article_key', 'error_type'];
  const payload = { event };
  for (const key of allowed) if (typeof context[key] === 'string') payload[key] = context[key];
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  window.dispatchEvent(new CustomEvent('karustep:measurement', { detail: payload }));
}
export function attribution() {
  const url = new URL(location.href);
  const entries = {
    lp_hero: ['lp', 'hero'], lp_footer: ['lp', 'footer'], lp_sticky: ['lp', 'sticky'],
    lp_contact: ['lp', 'footer'], lp_contact_footer: ['lp', 'footer'], lp_contact_sticky: ['lp', 'sticky'],
    contact_trial: ['contact_page', 'contact_trial'], legacy_contact: ['contact_page', 'unknown'],
    article_end: ['article', 'article_end']
  };
  let campaign = {};
  try { campaign = JSON.parse(sessionStorage.getItem('ks.acquisition') || '{}'); } catch { /* Storage may be unavailable. */ }
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid']) {
    const value = url.searchParams.get(key);
    if (value && value.length <= 200 && /^[a-zA-Z0-9_./~+\-=:%]+$/.test(value)) campaign[key] = value;
  }
  try { sessionStorage.setItem('ks.acquisition', JSON.stringify(campaign)); } catch { /* Receipt remains available in memory. */ }
  const entry = url.searchParams.get('entry') || 'unknown';
  const [entry_page_key, cta_placement] = entries[entry] || ['external', 'unknown'];
  let referrer_host = '';
  try { referrer_host = new URL(document.referrer).hostname; } catch { /* Direct entry. */ }
  return { ...campaign, entry: entries[entry] ? entry : 'unknown', entry_page_key, cta_placement,
    article_key: /^[a-z0-9-]{1,80}$/.test(url.searchParams.get('article') || '') ? url.searchParams.get('article') : 'none', referrer_host };
}
