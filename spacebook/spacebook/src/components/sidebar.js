import { navigateTo } from '../router/router.js';
import { clearSession } from '../auth/auth.js';

// Renderiza el sidebar con links según el rol del usuario
export function renderSidebar(user, onLogout) {
  const links = [{ label: '📋 Mis Reservas', page: 'reservas' }];

  // Links exclusivos de admin
  if (user.role === 'admin') {
    links.unshift({ label: '📊 Dashboard', page: 'dashboard' });
    links.push({ label: '🏢 Espacios',      page: 'espacios' });
  }

  document.getElementById('nav-links').innerHTML = links
    .map(l => `<a class="nav-link" data-page="${l.page}">${l.label}</a>`)
    .join('');

  // Click en cada link del nav
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => navigateTo(link.dataset.page));
  });

  // Info del usuario + botón logout
  document.getElementById('sidebar-user-info').innerHTML = `
    <span class="badge ${user.role}">${user.role}</span>
    <strong>${user.name}</strong>
    ${user.email}
    <button class="btn-logout" id="btn-logout">Cerrar sesión</button>
  `;

  document.getElementById('btn-logout').addEventListener('click', () => {
    clearSession();
    onLogout();
  });
}
