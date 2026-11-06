// Issued PID16660 ITP tag. Public sponsor/program identifiers are not credentials.
const SPONSOR = 11697;
const PROGRAM = 16660;
const SCRIPT = 'https://www.rentracks.jp/js/itp/rt.track.js';
const calls = new Map();
let scriptPromise;

function enabled(config, preview) {
  return config?.rentracksEnabled === true && preview !== true
    && location.protocol === 'https:' && location.hostname === 'mjs.main.jp';
}
function loadTag() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'text/javascript'; script.async = true;
    script.src = SCRIPT + '?t=' + Date.now();
    const timer = setTimeout(() => { script.remove(); reject(new Error('tag_timeout')); }, 10000);
    script.onload = () => { clearTimeout(timer); resolve(); };
    script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error('tag_load_failed')); };
    document.head.append(script);
  }).catch(error => { scriptPromise = undefined; throw error; });
  return scriptPromise;
}

export async function initializeRentracksLanding(config, { preview = false } = {}) {
  if (!enabled(config, preview) || location.pathname !== '/karustep-LP/') return false;
  try { await loadTag(); return true; } catch { return false; }
}

// Call only with the receipt response verified by the intake API, never from dataLayer.
export function trackRentracksReceipt(config, receipt) {
  if (!enabled(config, receipt?.preview) || receipt?.preview !== false || receipt?.saved !== true || receipt.formType !== 'trial'
    || !/^KS-[a-f0-9]{32}$/.test(receipt.receiptId || '')
    || location.pathname !== '/karustep-LP/forms/trial/complete/') return Promise.resolve(false);
  const key = `ks.rentracks.${PROGRAM}.${receipt.receiptId}`;
  if (calls.has(key)) return calls.get(key);
  try { if (sessionStorage.getItem(key)) return Promise.resolve(false); } catch { /* Receipt proof is memory-only in this case. */ }
  const operation = (async () => {
    try {
      await loadTag();
      if (!window._rt || typeof window.rt_tracktag !== 'function') throw new Error('tag_unavailable');
      // Fail closed if another instance has already dispatched this receipt.
      try { if (sessionStorage.getItem(key)) return false; } catch { /* In-page Map still prevents repeats. */ }
      Object.assign(window._rt, { sid: SPONSOR, pid: PROGRAM, price: 0, reward: -1,
        cname: '', ctel: '', cemail: '', cinfo: encodeURIComponent(receipt.receiptId) });
      try { sessionStorage.setItem(key, 'dispatching'); } catch { /* No customer fields are stored. */ }
      try { window.rt_tracktag(); }
      catch (error) { try { sessionStorage.removeItem(key); } catch { /* Optional. */ } throw error; }
      // Dispatch does not prove receipt by the ASP; that requires their test report.
      try { sessionStorage.setItem(key, 'dispatched'); } catch { /* Optional. */ }
      return true;
    } catch { calls.delete(key); return false; }
  })();
  calls.set(key, operation);
  return operation;
}
