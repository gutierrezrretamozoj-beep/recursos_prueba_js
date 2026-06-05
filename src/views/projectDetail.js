// ============================================================
// src/views/projectDetail.js
// Vista de detalle de un proyecto específico.
//   - Todos pueden ver los detalles
//   - Collaborator: puede cambiar solo el estado (de sus proyectos)
//   - Manager: puede editar todo (redirige a la lista con modal)
// ============================================================

import { getProjectById, updateProjectStatus, getAllUsers } from "../services/api.js";
import { getSession, isManager } from "../services/auth.js";
import { renderNavbar } from "../components/navbar.js";
import { showLoader } from "../components/loader.js";
import { showToast } from "../utils/toast.js";
import { navigate } from "../utils/router.js";

/**
 * Renderiza el detalle de un proyecto.
 *
 * @param {HTMLElement} container - Elemento #app
 * @param {number}      projectId - ID del proyecto a mostrar
 */
export async function renderProjectDetail(container, projectId) {
  const user = getSession();

  container.innerHTML = `
    <div class="page-wrapper">
      <main class="main-content" id="detail-content"></main>
    </div>
  `;

  renderNavbar(container.querySelector(".page-wrapper"));

  const content = document.getElementById("detail-content");
  showLoader(content);

  try {
    // Cargamos el proyecto y la lista de usuarios en paralelo
    const [project, users] = await Promise.all([
      getProjectById(projectId),
      getAllUsers(),
    ]);

    // Verificamos permisos: si es Collaborator y el proyecto no le pertenece,
    // lo redirigimos (no debería ver detalles de proyectos ajenos)
    if (!isManager() && project.assignedTo !== user.id) {
      showToast("No tienes permiso para ver este proyecto", "error");
      navigate("#projects");
      return;
    }

    // Mapa de id → nombre de usuario
    const userMap = {};
    users.forEach((u) => (userMap[u.id] = u.name));

    renderDetail(content, project, userMap, user);

  } catch (error) {
    content.innerHTML = `
      <div class="error-state">
        <p>No se pudo cargar el proyecto.</p>
        <button onclick="navigate('#projects')" class="btn-secondary">Volver</button>
      </div>
    `;
    showToast("Error al cargar el proyecto", "error");
  }
}

// ─────────────────────────────────────────────────────────────
// RENDERIZADO DEL DETALLE
// ─────────────────────────────────────────────────────────────

function renderDetail(content, project, userMap, user) {
  const canChangeStatus =
    !isManager() && project.assignedTo === user.id; // Collaborator en su propio proyecto

  content.innerHTML = `
    <div class="detail-page">

      <!-- Botón volver -->
      <button id="back-btn" class="btn-back">← Volver a proyectos</button>

      <div class="detail-card">

        <!-- Encabezado del proyecto -->
        <div class="detail-header">
          <div>
            <h2 class="detail-title">${project.name}</h2>
            <p class="detail-date">Creado el ${project.createdAt || "—"}</p>
          </div>
          <span class="status-badge status-${project.status.replace(" ", "-").toLowerCase()} status-lg">
            ${project.status}
          </span>
        </div>

        <!-- Descripción -->
        <div class="detail-section">
          <h4 class="detail-label">Descripción</h4>
          <p class="detail-text">${project.description}</p>
        </div>

        <!-- Responsable -->
        <div class="detail-section">
          <h4 class="detail-label">Responsable</h4>
          <p class="detail-text">${userMap[project.assignedTo] || "Sin asignar"}</p>
        </div>

        <!-- Acciones según rol -->
        <div class="detail-actions">

          <!-- El Collaborator puede cambiar el estado de sus proyectos -->
          ${canChangeStatus ? `
            <div class="status-update">
              <label class="form-label">Actualizar estado:</label>
              <div class="status-update-row">
                <select id="new-status" class="form-input form-select">
                  <option value="Pending" ${project.status === "Pending" ? "selected" : ""}>Pendiente</option>
                  <option value="In Progress" ${project.status === "In Progress" ? "selected" : ""}>En progreso</option>
                  <option value="Completed" ${project.status === "Completed" ? "selected" : ""}>Completado</option>
                </select>
                <button id="update-status-btn" class="btn-primary">Guardar estado</button>
              </div>
            </div>
          ` : ""}

          <!-- El Manager tiene botones de editar (en la lista) -->
          ${isManager() ? `
            <button id="edit-btn" class="btn-secondary">Editar en lista</button>
          ` : ""}

        </div>
      </div>
    </div>
  `;

  // ── Botón volver ─────────────────────────────────────────
  document.getElementById("back-btn").addEventListener("click", () => {
    navigate("#projects");
  });

  // ── Actualizar estado (Collaborator) ─────────────────────
  if (canChangeStatus) {
    document.getElementById("update-status-btn").addEventListener("click", async () => {
      const newStatus = document.getElementById("new-status").value;

      // No hacemos la petición si el estado no cambió
      if (newStatus === project.status) {
        showToast("El estado no ha cambiado", "info");
        return;
      }

      try {
        await updateProjectStatus(project.id, newStatus);
        showToast("Estado actualizado correctamente", "success");
        // Recargamos la vista del detalle con los datos nuevos
        renderProjectDetail(document.getElementById("app"), project.id);
      } catch (err) {
        showToast("Error al actualizar el estado", "error");
      }
    });
  }

  // ── Editar (Manager) ─────────────────────────────────────
  if (isManager()) {
    document.getElementById("edit-btn").addEventListener("click", () => {
      navigate("#projects"); // Redirigimos a la lista donde está el botón de editar
    });
  }
}
