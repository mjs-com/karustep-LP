// Same-origin navigation preserves acquisition without placing UTM on internal links.
(() => {
  // A single confirmed GA4 destination; legacy GA is disabled before the existing GTM loader.
  Promise.all([import('/karustep-LP/forms/assets/google-measurement.js'),
    import('/karustep-LP/forms/assets/rentracks.js'),
    fetch('/karustep-LP/forms/assets/config.json', { cache: 'no-store' }).then(r => r.json())])
    .then(([module, affiliate, config]) => {
      try { module.initializeMeasurement(config); } catch { /* Optional. */ }
      void affiliate.initializeRentracksLanding(config);
    }).catch(() => {});
  const url = new URL(location.href); const campaign = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid']) {
    const value = url.searchParams.get(key);
    if (value && value.length <= 200 && /^[a-zA-Z0-9_./~+\-=:%]+$/.test(value)) campaign[key] = value;
  }
  if (Object.keys(campaign).length) try { sessionStorage.setItem('ks.acquisition', JSON.stringify(campaign)); } catch { /* Optional. */ }
  document.querySelectorAll('a[href*="/forms/trial/"],a[href*="/forms/contact/"]').forEach(a => {
    const target = new URL(a.href); const entry = target.searchParams.get('entry') || 'unknown';
    a.addEventListener('click', () => {
      // Existing target=_blank remains usable; carry acquisition in fragment, never PII.
      let source = {};
      try { source = JSON.parse(sessionStorage.getItem('ks.acquisition') || '{}'); } catch { /* Optional. */ }
      if (Object.keys(source).length) target.hash = new URLSearchParams(source).toString();
      a.href = target.toString();
      window.dataLayer = window.dataLayer || [];
      const payload = { event: 'karustep_cta_click', form_type: target.pathname.includes('/trial/') ? 'trial' : 'contact',
        entry_page_key: 'lp', cta_placement: entry.replace(/^lp_(contact_)?/, '') };
      window.dataLayer.push(payload);
      window.dispatchEvent(new CustomEvent('karustep:measurement', { detail: payload }));
    });
  });
})();
