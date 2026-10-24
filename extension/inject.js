// Runs in the page itself (not the isolated content-script world).
// reel_watch_sequence returns the upcoming shorts, and each entry already
// carries the AI disclosure, so AI shorts are dropped before the player sees
// them. Something else (YouTube or another extension) also wraps fetch, so
// instead of wrapping fetch we patch how its responses are read: that catches
// the request no matter which fetch reference made it.
(() => {
  if (window.__skipAiShorts) return;
  window.__skipAiShorts = { blocked: 0 };

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

  const { text, json } = Response.prototype;

  Response.prototype.text = async function () {
    const body = await text.call(this);
    if (!isSequence(this)) return body;
    try {
      return filter(body);
    } catch (e) {
      console.debug('[skip-ai-shorts] filter', e);
      return body;
    }
  };

  Response.prototype.json = async function () {
    if (!isSequence(this)) return json.call(this);
    return JSON.parse(await this.text());
  };
})();
