// Google-only transport; the LP keeps GTM for existing non-GA integrations.
const eventNames = Object.freeze({
  karustep_cta_click: 'cta_click', karustep_form_view: 'form_view',
  karustep_form_begin: 'form_begin', karustep_form_submit_attempt: 'form_submit_attempt',
  karustep_form_error: 'form_error', karustep_form_saved: 'form_complete'
});
const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid'];
const contextKeys = ['form_type', 'form_id', 'entry_page_key', 'cta_placement', 'article_key', 'error_type'];
let destination = '';
let ready = false;
function safeCampaign(value) {
  if (typeof value !== 'string' || value.length > 200 || !/^[a-zA-Z0-9_./~+\-=:%]+$/.test(value)) return false;
  try { return !/[@\s]/.test(decodeURIComponent(value)); } catch { return false; }
}
export function measurementLocation() {
  const current = new URL(location.href);
  const result = new URL(current.origin + current.pathname);
  let stored = {};
  try { stored = JSON.parse(sessionStorage.getItem('ks.acquisition') || '{}'); } catch { /* Optional. */ }
  const fragment = new URLSearchParams(current.hash.slice(1));
  for (const key of campaignKeys) {
    const value = current.searchParams.get(key) || fragment.get(key) || stored[key];
    if (safeCampaign(value)) result.searchParams.set(key, value);
  }
  return result.toString();
}
export function forwardMeasurement(payload) {
  if (!ready || !Object.hasOwn(eventNames, payload?.event)) return;
  const parameters = { send_to: destination };
  for (const key of contextKeys) {
    const value = payload[key];
    if (typeof value === 'string' && value.length <= 80 && /^[a-z0-9_-]+$/.test(value)) parameters[key] = value;
  }
  // Never forward the entire dataLayer, receipt proof/ID, form values or free text.
  const name = payload.event === 'karustep_form_saved'
    ? (payload.form_type === 'trial' ? 'trial_complete' : payload.form_type === 'contact' ? 'contact_complete' : '')
    : eventNames[payload.event];
  if (name) window.gtag('event', name, parameters);
}
export function initializeMeasurement(config, { loadTag = true } = {}) {
  if (ready || config?.measurementEnabled !== true || !/^G-[A-Z0-9]{6,}$/.test(config?.ga4MeasurementId || '')) return false;
  const existingTag = document.querySelector('script[src*="googletagmanager.com/gtm.js"],script[src*="googletagmanager.com/gtag/js"]');
  // LP pages opt the legacy GA destination out before GTM loads; keep its other integrations.
  if (loadTag && existingTag && window['ga-disable-G-BRB4MY69SR'] !== true) return false;
  destination = config.ga4MeasurementId;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  if (loadTag) {
    const options = { page_location: measurementLocation(), allow_google_signals: false, allow_ad_personalization_signals: false };
    try { const referrer = new URL(document.referrer); options.page_referrer = referrer.origin + referrer.pathname; } catch { options.page_referrer = ''; }
    window.gtag('js', new Date());
    window.gtag('config', destination, options);
    const script = document.createElement('script'); script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + destination;
    document.head.append(script);
  }
  ready = true;
  window.addEventListener('karustep:measurement', event => forwardMeasurement(event.detail));
  return true;
}
