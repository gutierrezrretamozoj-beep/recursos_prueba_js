// Toast — notificación temporal en esquina inferior derecha

let timer = null;

export function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = ['show', type].filter(Boolean).join(' ');

  clearTimeout(timer);
  timer = setTimeout(() => { t.className = ''; }, 2800);
}
