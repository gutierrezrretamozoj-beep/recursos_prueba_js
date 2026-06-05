// ============================================================
// src/views/dashboard.js
// Vista de dashboard (página de inicio después del login).
// Muestra estadísticas diferentes según el rol del usuario:
//   - Manager: total de proyectos, activos, finalizados
//   - Collaborator: sus proyectos asignados y sus estados
// ============================================================

import { getAllProjects, getProjectsByUser } from "../services/api.js";
import { getSession, isManager } from "../services/auth.js";
import { renderNavbar } from "../components/navbar.js";
import { showLoader } from "../components/loader.js";
import { showToast } from "../utils/toast.js";
import { navigate } from "../utils/router.js";

/**
 * Renderiza el dashboard en el contenedor dado.
 *
 * @param {HTMLElement} container - Elemento #app
 */
export async function renderDashboard(container) {
  // Obtenemos la sesión del usuario actual
  const user = getSession();

  // Estructura base de la página (navbar + contenido)
  container.innerHTML = `
    <div class="page-wrapper">
      <!-- La navbar se insertará aquí por renderNavbar() -->
      <main class="main-content" id="dashboard-content">
        <!-- El loader se mostrará aquí mientras cargamos datos -->
      </main>
    </div>
  `;

  // Insertamos la navbar
  renderNavbar(container.querySelector(".page-wrapper"));

  // Referencia al área de contenido donde pondremos las estadísticas
  const content = document.getElementById("dashboard-content");

  // Mostramos el spinner mientras cargamos
  showLoader(content);

  try {
    // ── Carga de datos según rol ─────────────────────────
    let projects;

    if (isManager()) {
      // El manager ve TODOS los proyectos
      projects = await getAllProjects();
    } else {
      // El collaborator solo ve SUS proyectos
      projects = await getProjectsByUser(user.id);
    }

    // ── Renderizamos el contenido según el rol ───────────
    if (isManager()) {
      renderManagerDashboard(content, projects, user);
    } else {
      renderCollaboratorDashboard(content, projects, user);
    }

  } catch (error) {
    // Si falla la carga, mostramos un mensaje de error
    content.innerHTML = `
      <div class="error-state">
        <p class="error-icon">⚠️</p>
        <p class="error-msg">Error al cargar el dashboard.</p>
        <p class="error-hint">¿Está corriendo json-server?</p>
      </div>
    `;
    showToast("Error al cargar datos", "error");
    console.error(error);
  }
}

// ─────────────────────────────────────────────────────────────
// Dashboard del MANAGER
// ─────────────────────────────────────────────────────────────

/**
 * Renderiza las estadísticas del Manager.
 *
 * @param {HTMLElement} content  - Contenedor del contenido
 * @param {Array}       projects - Todos los proyectos
 * @param {object}      user     - Usuario actual
 */
function renderManagerDashboard(content, projects, user) {
  // Calculamos las estadísticas filtrando el array de proyectos
  const total = projects.length;
  const active = projects.filter((p) => p.status === "In Progress").length;
  const completed = projects.filter((p) => p.status === "Completed").length;
  const pending = projects.filter((p) => p.status === "Pending").length;

  content.innerHTML = `
    <div class="dashboard">
      <!-- Encabezado de bienvenida -->
      <div class="dashboard-header">
        <div>
          <h2 class="dashboard-title">Bienvenido, ${user.name} 👋</h2>
          <p class="dashboard-subtitle">Aquí tienes un resumen de todos los proyectos</p>
        </div>
        <!-- Botón rápido para ir a proyectos -->
        <button id="go-projects" class="btn-primary">Ver proyectos</button>
      </div>

      <!-- Tarjetas de estadísticas -->
      <div class="stats-grid">
        <div class="stat-card stat-total">
          <span class="stat-icon">📁</span>
          <div class="stat-info">
            <span class="stat-number">${total}</span>
            <span class="stat-label">Total proyectos</span>
          </div>
        </div>

        <div class="stat-card stat-active">
          <span class="stat-icon">🔄</span>
          <div class="stat-info">
            <span class="stat-number">${active}</span>
            <span class="stat-label">En progreso</span>
          </div>
        </div>

        <div class="stat-card stat-pending">
          <span class="stat-icon">⏳</span>
          <div class="stat-info">
            <span class="stat-number">${pending}</span>
            <span class="stat-label">Pendientes</span>
          </div>
        </div>

        <div class="stat-card stat-done">
          <span class="stat-icon">✅</span>
          <div class="stat-info">
            <span class="stat-number">${completed}</span>
            <span class="stat-label">Completados</span>
          </div>
        </div>
      </div>

      <!-- Lista rápida de proyectos recientes -->
      <div class="recent-projects">
        <h3 class="section-title">Proyectos recientes</h3>
        <div class="projects-list">
          ${projects
            .slice(0, 5) // Mostramos los primeros 5
            .map((p) => `
              <div class="project-row" data-id="${p.id}">
                <span class="project-row-name">${p.name}</span>
                <span class="status-badge status-${p.status.replace(" ", "-").toLowerCase()}">${p.status}</span>
              </div>
            `)
            .join("")}
        </div>
      </div>
    </div>
  `;

  // ── Eventos ──────────────────────────────────────────────
  // Botón "Ver proyectos"
  document.getElementById("go-projects").addEventListener("click", () => {
    navigate("#projects");
  });

  // Click en cualquier fila de proyecto → ir al detalle
  document.querySelectorAll(".project-row").forEach((row) => {
    row.addEventListener("click", () => {
      navigate(`#project/${row.dataset.id}`);
    });
  });
}

// ─────────────────────────────────────────────────────────────
// Dashboard del COLLABORATOR
// ─────────────────────────────────────────────────────────────

/**
 * Renderiza el dashboard del Collaborator.
 *
 * @param {HTMLElement} content  - Contenedor del contenido
 * @param {Array}       projects - Proyectos asignados a este usuario
 * @param {object}      user     - Usuario actual
 */
function renderCollaboratorDashboard(content, projects, user) {
  content.innerHTML = `
    <div class="dashboard">
      <div class="dashboard-header">
        <div>
          <h2 class="dashboard-title">Hola, ${user.name} 👋</h2>
          <p class="dashboard-subtitle">Tienes ${projects.length} proyecto(s) asignado(s)</p>
        </div>
        <button id="go-projects" class="btn-primary">Mis proyectos</button>
      </div>

      <!-- Estadísticas simples del colaborador -->
      <div class="stats-grid">
        <div class="stat-card stat-total">
          <span class="stat-icon">📋</span>
          <div class="stat-info">
            <span class="stat-number">${projects.length}</span>
            <span class="stat-label">Asignados</span>
          </div>
        </div>

        <div class="stat-card stat-active">
          <span class="stat-icon">🔄</span>
          <div class="stat-info">
            <span class="stat-number">${projects.filter(p => p.status === "In Progress").length}</span>
            <span class="stat-label">En progreso</span>
          </div>
        </div>

        <div class="stat-card stat-done">
          <span class="stat-icon">✅</span>
          <div class="stat-info">
            <span class="stat-number">${projects.filter(p => p.status === "Completed").length}</span>
            <span class="stat-label">Completados</span>
          </div>
        </div>
      </div>

      <!-- Lista de proyectos asignados con su estado -->
      <div class="recent-projects">
        <h3 class="section-title">Mis proyectos</h3>
        ${projects.length === 0
          ? `<p class="empty-state">No tienes proyectos asignados aún.</p>`
          : `<div class="projects-list">
              ${projects.map((p) => `
                <div class="project-row" data-id="${p.id}">
                  <span class="project-row-name">${p.name}</span>
                  <span class="status-badge status-${p.status.replace(" ", "-").toLowerCase()}">${p.status}</span>
                </div>
              `).join("")}
            </div>`
        }
      </div>
    </div>
  `;

  document.getElementById("go-projects").addEventListener("click", () => {
    navigate("#projects");
  });

  document.querySelectorAll(".project-row").forEach((row) => {
    row.addEventListener("click", () => {
      navigate(`#project/${row.dataset.id}`);
    });
  });
}
