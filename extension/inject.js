// Runs in the page itself (not the isolated content-script world) so it can
// wrap YouTube's fetch. reel_watch_sequence returns the upcoming shorts, and
// each entry already carries the AI disclosure, so AI shorts are dropped
// before the player ever sees them.
(() => {
  const AI = /altered or fully generated|"title":"AI"|"title":"ИИ"/;
  const orig = window.fetch;

  window.fetch = async function (...args) {
    const res = await orig.apply(this, args);
    const url = String((args[0] && args[0].url) || args[0]);
    if (!url.includes('/youtubei/v1/reel/reel_watch_sequence')) return res;
    try {
      const data = await res.clone().json();
      const before = (data.entries || []).length;
      data.entries = (data.entries || []).filter((e) => !AI.test(JSON.stringify(e)));
      const blocked = before - data.entries.length;
      if (!blocked) return res;
      window.postMessage({ source: 'skip-ai-shorts', blocked }, location.origin);
      return new Response(JSON.stringify(data), {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
      });
    } catch (e) {
      console.debug('[skip-ai-shorts] filter', e);
      return res;
    }
  };
})();
