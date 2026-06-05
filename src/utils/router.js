// ============================================================
// src/utils/router.js
// Sistema de navegación SPA: cambia vistas SIN recargar la página.
// Usa el hash (#) de la URL para saber qué vista mostrar.
// Ej: index.html#dashboard → muestra el dashboard
// ============================================================

import { isAuthenticated, isManager } from "../services/auth.js";
import { renderLogin } from "../views/login.js";
import { renderDashboard } from "../views/dashboard.js";
import { renderProjects } from "../views/projects.js";
import { renderProjectDetail } from "../views/projectDetail.js";

// El contenedor principal donde se renderizarán todas las vistas
const app = document.getElementById("app");

/**
 * Navega a una ruta específica cambiando el hash de la URL.
 * Esto dispara el evento 'hashchange' que escuchamos abajo.
 *
 * @param {string} route - La ruta destino, ej: "#dashboard"
 */
export function navigate(route) {
  window.location.hash = route;
}

/**
 * Función principal del router.
 * Lee el hash actual de la URL y decide qué vista renderizar.
 * También protege las rutas privadas.
 */
export function handleRoute() {
  // window.location.hash devuelve "#dashboard", "#login", etc.
  // Si el hash está vacío, usamos "#login" como ruta por defecto
  const hash = window.location.hash || "#login";

  // ── Protección de rutas ──────────────────────────────────
  // Si no hay sesión activa y no es la página de login → redirigir a login
  if (!isAuthenticated() && hash !== "#login") {
    navigate("#login");
    return; // Salimos para no seguir ejecutando el resto
  }

  // Si HAY sesión y estamos en login → redirigir al dashboard
  if (isAuthenticated() && hash === "#login") {
    navigate("#dashboard");
    return;
  }

  // Si es Collaborator e intenta acceder a ruta solo de managers
  // (En este proyecto solo protegemos el acceso general, los permisos
  //  específicos se manejan dentro de cada vista)

  // ── Renderizado de vistas ────────────────────────────────
  // Extraemos el nombre de la ruta sin el # y sin parámetros
  // Ej: "#project/3" → ["project", "3"]
  const [route, param] = hash.replace("#", "").split("/");

  // Limpiamos el contenedor antes de renderizar la nueva vista
  app.innerHTML = "";

  // Decidimos qué función de vista llamar según la ruta
  switch (route) {
    case "login":
      renderLogin(app);
      break;

    case "dashboard":
      renderDashboard(app);
      break;

    case "projects":
      renderProjects(app);
      break;

    case "project":
      // Pasamos el ID del proyecto como parámetro
      renderProjectDetail(app, parseInt(param));
      break;

    default:
      // Ruta desconocida → ir al dashboard o login
      navigate(isAuthenticated() ? "#dashboard" : "#login");
  }
}

/**
 * Inicializa el router:
 * 1. Escucha cambios de hash (navegación SPA)
 * 2. Maneja la ruta actual al cargar la página
 */
export function initRouter() {
  // hashchange se dispara cada vez que cambia el hash de la URL
  window.addEventListener("hashchange", handleRoute);

  // Manejamos la ruta inicial (cuando el usuario carga/recarga la página)
  handleRoute();
}
