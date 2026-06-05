// ══════════════════════════════════════════════════════
// main.js — punto de entrada y orquestador principal
// ══════════════════════════════════════════════════════

import { restoreSession, clearSession }              from './auth/auth.js';
import { initLogin }                                 from './pages/login.js';
import { renderDashboard }                           from './pages/dashboard.js';
import { initReservas, renderReservas,
         openNewReservaModal, saveReserva }          from './pages/reservas.js';
import { renderEspacios,
         openNewEspacioModal, saveEspacio }          from './pages/espacios.js';
import { renderSidebar }                             from './components/sidebar.js';
import { initModalOverlays, closeModal }             from './components/modal.js';
import { registerRoute, initRouter, navigateTo }     from './router/router.js';

let currentUser = null;

// ── Arranca la app ──────────────────────────────────
(function bootstrap() {
  // Intentar restaurar sesión guardada en localStorage
  const session = restoreSession();

  if (session) {
    currentUser = session;
    startApp();
  } else {
    // Mostrar pantalla de login
    showLoginPage();
  }
})();

// ── Muestra la pantalla de login ────────────────────
function showLoginPage() {
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('app').style.display        = 'none';

  initLogin(user => {
    currentUser = user;
    startApp();
  });
}

// ── Inicializa la SPA tras autenticarse ─────────────
function startApp() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('app').style.display        = 'flex';

  // Pasar usuario a los módulos que lo necesitan
  initReservas(currentUser);

  // Registrar rutas con sus roles permitidos
  registerRoute('dashboard', renderDashboard, ['admin']);
  registerRoute('reservas',  renderReservas,  ['admin', 'user']);
  registerRoute('espacios',  renderEspacios,  ['admin']);

  // Iniciar router (escucha hashchange)
  initRouter(currentUser);

  // Iniciar eventos de modales
  initModalOverlays();
  initModalButtons();

  // Renderizar sidebar con nav y botón de logout
  renderSidebar(currentUser, handleLogout);

  // Navegar a la ruta inicial según el rol
  const initialRoute = currentUser.role === 'admin' ? 'dashboard' : 'reservas';
  navigateTo(initialRoute);
}

// ── Eventos de los botones de los modales ───────────
function initModalButtons() {
  // Reservas
  document.getElementById('btn-nueva-reserva')
    .addEventListener('click', openNewReservaModal);
  document.getElementById('btn-save-reserva')
    .addEventListener('click', saveReserva);
  document.getElementById('btn-cancel-reserva')
    .addEventListener('click', () => closeModal('modal-reserva'));

  // Espacios
  document.getElementById('btn-nuevo-espacio')
    .addEventListener('click', openNewEspacioModal);
  document.getElementById('btn-save-espacio')
    .addEventListener('click', saveEspacio);
  document.getElementById('btn-cancel-espacio')
    .addEventListener('click', () => closeModal('modal-espacio'));
}

// ── Cerrar sesión ───────────────────────────────────
function handleLogout() {
  clearSession();
  currentUser = null;
  showLoginPage();
}
