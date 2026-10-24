const api = globalThis.browser ?? globalThis.chrome;

function dayKey(offset) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toLocaleDateString('en-CA');
}

async function render() {
  const { stats = { total: 0, days: {} } } = await api.storage.local.get('stats');
  let week = 0;
  for (let i = 0; i < 7; i++) week += stats.days[dayKey(i)] || 0;
  document.getElementById('today').textContent = stats.days[dayKey(0)] || 0;
  document.getElementById('week').textContent = week;
  document.getElementById('total').textContent = stats.total;
}

document.getElementById('reset').addEventListener('click', async () => {
  await api.storage.local.remove('stats');
  render();
});

api.storage.onChanged.addListener(render);
render();
