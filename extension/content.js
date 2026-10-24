// YouTube shows the AI disclosure only inside the Shorts player, so we check
// the active short and jump to the next one when the label is present.
const MARKERS = [
  /altered or synthetic/i,
  /synthetic content/i,
  /made with ai/i,
  /ai-generated/i,
  /изменённый или синтетический/i,
  /синтетический контент/i,
];

const ACTIVE = [
  'ytd-reel-video-renderer[is-active]', // desktop, one renderer per short
  'ytm-reel-player-overlay-renderer',   // mobile web (m.youtube.com)
].join(',');

// Newer desktop layout keeps a single renderer for every short and drops
// is-active, so fall back to it when it's the only one.
function activeShort() {
  const el = document.querySelector(ACTIVE);
  if (el) return el;
  const all = document.querySelectorAll('ytd-reel-video-renderer');
  return all.length === 1 ? all[0] : null;
}

// Newer layouts show only a compact "ⓘ AI" chip (a button in the metapanel
// carousel), so also accept any text node that is just that word.
const CHIP = /^\s*(AI|ИИ)\s*$/;

function isAi(el) {
  if (MARKERS.some((re) => re.test(el.innerText || ''))) return true;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    if (CHIP.test(walker.currentNode.nodeValue)) return true;
  }
  return false;
}

const api = globalThis.browser ?? globalThis.chrome;

// Stats live in extension storage: a running total plus per-day counts
// (keyed by local YYYY-MM-DD) so the popup can show today / 7 days / all time.
async function record() {
  const day = new Date().toLocaleDateString('en-CA');
  const { stats = { total: 0, days: {} } } = await api.storage.local.get('stats');
  stats.total += 1;
  stats.days[day] = (stats.days[day] || 0) + 1;
  await api.storage.local.set({ stats });
}

function next() {
  const btn = document.querySelector('#navigation-button-down button');
  if (btn) return btn.click();
  // Fallback: the Shorts player reacts to ArrowDown.
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, bubbles: true }));
}

let pending = false;
function check() {
  if (pending || !location.pathname.startsWith('/shorts/')) return;
  pending = true;
  requestAnimationFrame(() => {
    pending = false;
    const active = activeShort();
    if (!active || active.dataset.aiSkipped === location.pathname) return;
    if (isAi(active)) {
      active.dataset.aiSkipped = location.pathname;
      console.debug('[skip-ai-shorts] skipping', location.pathname);
      next();
      record().catch((e) => console.debug('[skip-ai-shorts] stats', e));
    }
  });
}

new MutationObserver(check).observe(document.documentElement, { childList: true, subtree: true });
document.addEventListener('yt-navigate-finish', check);
check();
