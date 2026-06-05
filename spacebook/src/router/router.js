// Router SPA — navega entre vistas usando el hash de la URL (#ruta)

let currentUser = null; // referencia al usuario logueado (se inyecta desde main.js)
const routes = {};      // mapa { hash: { render, roles } }

// Registra una ruta con su función de render y roles permitidos
export function registerRoute(hash, renderFn, allowedRoles = ['admin', 'user']) {
  routes[hash] = { render: renderFn, roles: allowedRoles };
}

// Navega a una ruta
export function navigateTo(hash) {
  const route = routes[hash];

  if (!route) { navigateTo('reservas'); return; }

  // Guard de roles — redirige si el usuario no tiene permiso
  if (!route.roles.includes(currentUser?.role)) {
    import('../components/toast.js').then(m => m.showToast('Acceso denegado', 'error'));
    navigateTo(currentUser?.role === 'admin' ? 'dashboard' : 'reservas');
    return;
  }

  location.hash = hash;
  renderPage(hash);
}

// Renderiza la página según el hash activo
function renderPage(hash) {
  const route = routes[hash];
  if (!route) return;

  // Marcar nav link activo
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === hash);
  });

  // Mostrar solo la página correspondiente
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pageEl = document.getElementById(`page-${hash}`);
  if (pageEl) pageEl.classList.add('active');

  route.render();
}

// Escucha cambios de hash (botón atrás/adelante del navegador)
export function initRouter(user) {
  currentUser = user;
  window.addEventListener('hashchange', () => {
    const hash = location.hash.replace('#', '') || 'reservas';
    navigateTo(hash);
  });
}
