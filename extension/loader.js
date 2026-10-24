// Content scripts live in an isolated world, so load inject.js into the page
// as early as possible and relay its "blocked" counts into the stats.
// Shares scope with content.js, which defines api and record().

const s = document.createElement('script');
s.src = api.runtime.getURL('inject.js');
s.onload = () => s.remove();
(document.head || document.documentElement).appendChild(s);

window.addEventListener('message', (ev) => {
  if (ev.source !== window || ev.data?.source !== 'skip-ai-shorts') return;
  record(ev.data.blocked).catch((e) => console.debug('[skip-ai-shorts] stats', e));
});
