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
  'ytd-reel-video-renderer[is-active]', // desktop
  'ytm-reel-player-overlay-renderer',   // mobile web (m.youtube.com)
].join(',');

function isAi(el) {
  return MARKERS.some((re) => re.test(el.innerText || ''));
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
    const active = document.querySelector(ACTIVE);
    if (!active || active.dataset.aiSkipped === location.pathname) return;
    if (isAi(active)) {
      active.dataset.aiSkipped = location.pathname;
      console.debug('[skip-ai-shorts] skipping', location.pathname);
      next();
    }
  });
}

new MutationObserver(check).observe(document.documentElement, { childList: true, subtree: true });
document.addEventListener('yt-navigate-finish', check);
check();
