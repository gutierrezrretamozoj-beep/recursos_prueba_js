// ============================================================
// src/views/projects.js
// Vista de lista de proyectos con CRUD completo.
//   - Manager: ve todos, puede crear, editar y eliminar
//   - Collaborator: ve solo los suyos, puede cambiar estado
// ============================================================

import {
  getAllProjects,
  getProjectsByUser,
  createProject,
  updateProject,
  deleteProject,
  getAllUsers,
} from "../services/api.js";
import { getSession, isManager } from "../services/auth.js";
import { renderNavbar } from "../components/navbar.js";
import { showLoader } from "../components/loader.js";
import { showToast } from "../utils/toast.js";
import { navigate } from "../utils/router.js";

// ─────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL
// ─────────────────────────────────────────────────────────────

export async function renderProjects(container) {
  const user = getSession();

  container.innerHTML = `
    <div class="page-wrapper">
      <main class="main-content" id="projects-content"></main>
    </div>
  `;

  renderNavbar(container.querySelector(".page-wrapper"));

  const content = document.getElementById("projects-content");
  showLoader(content);

  try {
    // Cargamos proyectos y usuarios en paralelo para ser más eficientes
    // Promise.all espera a que AMBAS promesas terminen
    const [projects, users] = await Promise.all([
      isManager() ? getAllProjects() : getProjectsByUser(user.id),
      getAllUsers(),
    ]);

    renderProjectsView(content, projects, users, user);

  } catch (error) {
    content.innerHTML = `<div class="error-state"><p>Error al cargar proyectos</p></div>`;
    showToast("Error al cargar proyectos", "error");
  }
}

// ─────────────────────────────────────────────────────────────
// RENDERIZADO DE LA LISTA
// ─────────────────────────────────────────────────────────────

/**
 * Construye la vista completa de proyectos.
 *
 * @param {HTMLElement} content  - Contenedor
 * @param {Array}       projects - Lista de proyectos
 * @param {Array}       users    - Lista de usuarios (para mostrar nombres)
 * @param {object}      user     - Usuario actual
 */
function renderProjectsView(content, projects, users, user) {
  // Mapa de id → nombre de usuario para buscar rápidamente
  // { 1: "Ana García", 2: "Carlos López", ... }
  const userMap = {};
  users.forEach((u) => (userMap[u.id] = u.name));

  content.innerHTML = `
    <div class="projects-page">

      <!-- Encabezado con título, buscador y botón crear -->
      <div class="projects-header">
        <h2 class="page-title">${isManager() ? "Todos los proyectos" : "Mis proyectos"}</h2>

        <div class="projects-controls">
          <!-- Buscador (punto extra) -->
          <input
            type="text"
            id="search-input"
            class="search-input"
            placeholder="🔍 Buscar proyecto..."
          />

          <!-- Filtro por estado (punto extra) -->
          <select id="filter-status" class="filter-select">
            <option value="">Todos los estados</option>
            <option value="Pending">Pendiente</option>
            <option value="In Progress">En progreso</option>
            <option value="Completed">Completado</option>
          </select>

          <!-- Botón crear: solo visible para Manager -->
          ${isManager()
            ? `<button id="create-btn" class="btn-primary">+ Nuevo proyecto</button>`
            : ""
          }
        </div>
      </div>

      <!-- Tabla de proyectos -->
      <div id="projects-table-wrapper">
        ${renderProjectsTable(projects, userMap)}
      </div>

    </div>

    <!-- Modal para crear/editar (oculto por defecto) -->
    <div id="modal-overlay" class="modal-overlay hidden">
      <div class="modal" id="project-modal">
        <!-- El contenido del modal se inyecta dinámicamente -->
      </div>
    </div>
  `;

  // Guardamos los proyectos originales para poder filtrar/buscar
  let currentProjects = [...projects];

  // ── Buscador ─────────────────────────────────────────────
  document.getElementById("search-input").addEventListener("input", (e) => {
    filterAndRender(e.target.value, document.getElementById("filter-status").value);
  });

  // ── Filtro por estado ─────────────────────────────────────
  document.getElementById("filter-status").addEventListener("change", (e) => {
    filterAndRender(document.getElementById("search-input").value, e.target.value);
  });

  /**
   * Filtra los proyectos por texto y/o estado, y vuelve a renderizar la tabla.
   */
  function filterAndRender(searchText, statusFilter) {
    let filtered = currentProjects;

    // Filtrar por texto (en nombre o descripción)
    if (searchText.trim()) {
      const term = searchText.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
      );
    }

    // Filtrar por estado
    if (statusFilter) {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Re-renderizamos solo la tabla (no toda la página)
    document.getElementById("projects-table-wrapper").innerHTML =
      renderProjectsTable(filtered, userMap);

    // Volvemos a asignar los eventos de los botones de la tabla
    attachTableEvents(userMap);
  }

  // ── Botón crear proyecto ─────────────────────────────────
  if (isManager()) {
    document.getElementById("create-btn").addEventListener("click", () => {
      openProjectModal(null, users, async (formData) => {
        // Callback que se ejecuta cuando el usuario guarda el formulario
        try {
          await createProject(formData);
          showToast("Proyecto creado correctamente", "success");
          // Recargamos la vista para mostrar el nuevo proyecto
          await renderProjects(document.getElementById("app"));
        } catch (err) {
          showToast("Error al crear el proyecto", "error");
        }
      });
    });
  }

  // Asignamos eventos a los botones de la tabla inicial
  attachTableEvents(userMap);
}

// ─────────────────────────────────────────────────────────────
// TABLA DE PROYECTOS
// ─────────────────────────────────────────────────────────────

/**
 * Genera el HTML de la tabla de proyectos.
 * Recibe los proyectos a mostrar (ya filtrados si aplica).
 */
function renderProjectsTable(projects, userMap) {
  if (projects.length === 0) {
    return `<div class="empty-state">
      <p>No se encontraron proyectos.</p>
    </div>`;
  }

  // Generamos una fila por cada proyecto
  const rows = projects
    .map(
      (p) => `
      <tr data-id="${p.id}">
        <td class="td-name">
          <a href="#project/${p.id}" class="project-link">${p.name}</a>
        </td>
        <td class="td-desc">${p.description}</td>
        <td>
          <span class="status-badge status-${p.status.replace(" ", "-").toLowerCase()}">
            ${p.status}
          </span>
        </td>
        <td>${userMap[p.assignedTo] || "Sin asignar"}</td>
        <td>${p.createdAt || "—"}</td>
        <td class="td-actions">
          <!-- Botones condicionales según rol -->
          ${
            isManager()
              ? `<button class="btn-edit btn-sm" data-id="${p.id}">Editar</button>
                 <button class="btn-delete btn-sm" data-id="${p.id}">Eliminar</button>`
              : `<!-- Collaborator solo puede ver el detalle -->
                 <a href="#project/${p.id}" class="btn-view btn-sm">Ver</a>`
          }
        </td>
      </tr>
    `
    )
    .join("");

  return `
    <table class="projects-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Estado</th>
          <th>Responsable</th>
          <th>Fecha</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

// ─────────────────────────────────────────────────────────────
// EVENTOS DE LA TABLA (editar / eliminar)
// ─────────────────────────────────────────────────────────────

/**
 * Asigna los eventos click a los botones de editar y eliminar.
 * Se llama cada vez que la tabla es re-renderizada.
 */
async function attachTableEvents(userMap) {
  // ── Botones Editar ───────────────────────────────────────
  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = parseInt(btn.dataset.id);

      try {
        // Cargamos datos actuales del proyecto para prellenar el formulario
        const [{ default: api }, users] = await Promise.all([
          import("../services/api.js"),
          getAllUsers(),
        ]);

        // Buscamos el proyecto en el servidor
        const project = await (await import("../services/api.js")).getProjectById(id);

        // Abrimos el modal con los datos del proyecto
        openProjectModal(project, users, async (formData) => {
          try {
            await updateProject(id, { ...project, ...formData });
            showToast("Proyecto actualizado", "success");
            await renderProjects(document.getElementById("app"));
          } catch (err) {
            showToast("Error al actualizar", "error");
          }
        });
      } catch (err) {
        showToast("Error al cargar el proyecto", "error");
      }
    });
  });

  // ── Botones Eliminar ─────────────────────────────────────
  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = parseInt(btn.dataset.id);

      // Pedimos confirmación antes de eliminar (buena UX)
      if (!confirm("¿Estás seguro de que deseas eliminar este proyecto?")) return;

      try {
        await deleteProject(id);
        showToast("Proyecto eliminado", "success");
        // Recargamos la vista
        await renderProjects(document.getElementById("app"));
      } catch (err) {
        showToast("Error al eliminar", "error");
      }
    });
  });
}

// ─────────────────────────────────────────────────────────────
// MODAL DE CREAR / EDITAR PROYECTO
// ─────────────────────────────────────────────────────────────

/**
 * Abre el modal con el formulario de proyecto.
 *
 * @param {object|null} project  - null = crear nuevo; objeto = editar existente
 * @param {Array}       users    - Lista de usuarios para el selector de responsable
 * @param {Function}    onSave   - Callback que se ejecuta al guardar
 */
function openProjectModal(project, users, onSave) {
  const isEditing = project !== null;
  const overlay = document.getElementById("modal-overlay");
  const modal = document.getElementById("project-modal");

  // Opciones del selector de responsable
  const userOptions = users
    .filter((u) => u.role === "collaborator") // Solo colaboradores como responsables
    .map(
      (u) =>
        `<option value="${u.id}" ${project?.assignedTo === u.id ? "selected" : ""}>
          ${u.name}
        </option>`
    )
    .join("");

  // Contenido del modal
  modal.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">${isEditing ? "Editar proyecto" : "Nuevo proyecto"}</h3>
      <button id="close-modal" class="modal-close">✕</button>
    </div>

    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">Nombre *</label>
        <input
          type="text"
          id="proj-name"
          class="form-input"
          value="${project?.name || ""}"
          placeholder="Nombre del proyecto"
          maxlength="100"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Descripción *</label>
        <textarea
          id="proj-desc"
          class="form-input form-textarea"
          placeholder="Descripción del proyecto"
          maxlength="300"
        >${project?.description || ""}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Estado *</label>
        <select id="proj-status" class="form-input form-select">
          <option value="Pending" ${project?.status === "Pending" ? "selected" : ""}>Pendiente</option>
          <option value="In Progress" ${project?.status === "In Progress" ? "selected" : ""}>En progreso</option>
          <option value="Completed" ${project?.status === "Completed" ? "selected" : ""}>Completado</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Responsable *</label>
        <select id="proj-assigned" class="form-input form-select">
          <option value="">Seleccionar responsable...</option>
          ${userOptions}
        </select>
      </div>

      <!-- Mensaje de error del formulario -->
      <p id="modal-error" class="login-error hidden"></p>
    </div>

    <div class="modal-footer">
      <button id="cancel-modal" class="btn-secondary">Cancelar</button>
      <button id="save-modal" class="btn-primary">
        ${isEditing ? "Actualizar" : "Crear proyecto"}
      </button>
    </div>
  `;

  // Mostramos el overlay (fondo oscuro) y el modal
  overlay.classList.remove("hidden");

  // ── Cerrar modal ─────────────────────────────────────────
  const closeModal = () => overlay.classList.add("hidden");

  document.getElementById("close-modal").addEventListener("click", closeModal);
  document.getElementById("cancel-modal").addEventListener("click", closeModal);

  // Cerrar al hacer click en el fondo oscuro
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  // ── Guardar proyecto ─────────────────────────────────────
  document.getElementById("save-modal").addEventListener("click", async () => {
    const name = document.getElementById("proj-name").value.trim();
    const description = document.getElementById("proj-desc").value.trim();
    const status = document.getElementById("proj-status").value;
    const assignedTo = parseInt(document.getElementById("proj-assigned").value);
    const errorEl = document.getElementById("modal-error");

    // ── Validaciones ────────────────────────────────────
    if (!name) {
      errorEl.textContent = "El nombre es requerido";
      errorEl.classList.remove("hidden");
      return;
    }

    if (!description) {
      errorEl.textContent = "La descripción es requerida";
      errorEl.classList.remove("hidden");
      return;
    }

    if (!assignedTo) {
      errorEl.textContent = "Debes seleccionar un responsable";
      errorEl.classList.remove("hidden");
      return;
    }

    // Ocultamos el error si todo está bien
    errorEl.classList.add("hidden");

    // Llamamos al callback con los datos del formulario
    await onSave({ name, description, status, assignedTo });

    // Cerramos el modal
    closeModal();
  });
}
