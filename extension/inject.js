// Runs in the page itself (not the isolated content-script world).
// reel_watch_sequence returns the upcoming shorts, and each entry already
// carries the AI disclosure, so AI shorts are dropped before the player sees
// them. The response is replaced in a fetch wrapper, so it doesn't matter
// how YouTube reads the body (text, json, arrayBuffer or a stream).
(() => {
  if (window.__skipAiShorts) return;
  window.__skipAiShorts = { seen: 0, blocked: 0 };

  const AI = /altered or fully generated|"title":"AI"|"title":"ИИ"/;
  const isSequence = (res) => res.url.includes('/youtubei/v1/reel/reel_watch_sequence');

  function filter(text) {
    const data = JSON.parse(text);
    const entries = data.entries || [];
    data.entries = entries.filter((e) => !AI.test(JSON.stringify(e)));
    const blocked = entries.length - data.entries.length;
    if (!blocked) return text;
    window.__skipAiShorts.blocked += blocked;
    window.postMessage({ source: 'skip-ai-shorts', blocked }, location.origin);
    return JSON.stringify(data);
  }

  // Something on the page (YouTube or another extension) replaces
  // window.fetch after us, so later requests skipped our wrapper. Keep ours
  // outermost: whatever gets assigned becomes the function we wrap.
  // If the replacement itself wraps ours, it calls back into us; the busy
  // flag sends that nested call straight to the original fetch.
  const original = window.fetch;
  let inner = original;
  let busy = false;

  async function wrapped(...args) {
    let pending;
    if (busy) return original.apply(this, args);
    busy = true;
    try {
      pending = inner.apply(this, args);
    } finally {
      busy = false;
    }
    const res = await pending;
    if (!isSequence(res)) return res;
    window.__skipAiShorts.seen += 1;
    try {
      const body = await res.clone().text();
      const filtered = filter(body);
      if (filtered === body) return res;
      const out = new Response(filtered, {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
      });
      Object.defineProperty(out, 'url', { value: res.url });
      return out;
    } catch (e) {
      console.debug('[skip-ai-shorts] filter', e);
      return res;
    }
  }

  Object.defineProperty(window, 'fetch', {
    configurable: true,
    get: () => wrapped,
    set: (fn) => {
      if (fn !== wrapped) inner = fn;
    },
  });
})();
