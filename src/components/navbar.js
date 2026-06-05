// ============================================================
// src/components/navbar.js
// Componente de navegación superior.
// Se muestra en todas las páginas privadas (dashboard, proyectos).
// Cambia según el rol del usuario.
// ============================================================

import { getSession, clearSession } from "../services/auth.js";
import { navigate } from "../utils/router.js";
import { showToast } from "../utils/toast.js";

/**
 * Crea e inserta la barra de navegación en el contenedor indicado.
 * Siempre se llama al inicio de cada vista privada.
 *
 * @param {HTMLElement} container - El elemento donde se insertará la navbar
 */
export function renderNavbar(container) {
  // Obtenemos el usuario de la sesión para mostrar su nombre y rol
  const user = getSession();

  // Creamos el elemento nav
  const nav = document.createElement("nav");
  nav.className = "navbar";

  // HTML de la navbar con datos dinámicos del usuario
  nav.innerHTML = `
    <div class="nav-brand">
      <span class="nav-logo">⬡</span>
      <span class="nav-title">ProjectHub</span>
    </div>

    <div class="nav-links">
      <!-- Solo mostramos el link de "Todos los proyectos" si el usuario existe -->
      <a href="#dashboard" class="nav-link">Dashboard</a>
      <a href="#projects" class="nav-link">Proyectos</a>
    </div>

    <div class="nav-user">
      <!-- Mostramos el rol con una etiqueta de color diferente -->
      <span class="nav-role ${user.role}">${user.role === "manager" ? "Manager" : "Collaborator"}</span>
      <span class="nav-name">${user.name}</span>
      <!-- Botón de logout -->
      <button id="logout-btn" class="btn-logout">Salir</button>
    </div>
  `;

  // Insertamos la navbar al INICIO del contenedor (antes del contenido)
  container.insertAdjacentElement("afterbegin", nav);

  // ── Evento de logout ─────────────────────────────────────
  // Seleccionamos el botón DESPUÉS de insertarlo en el DOM
  document.getElementById("logout-btn").addEventListener("click", () => {
    clearSession();          // Borramos la sesión de localStorage
    showToast("Sesión cerrada correctamente", "info");
    navigate("#login");      // Redirigimos al login
  });
}
