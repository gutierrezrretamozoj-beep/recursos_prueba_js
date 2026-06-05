// ╔══════════════════════════════════════════════════════════════╗
// ║          FUNCIONES LISTAS PARA LA PRUEBA DE MAÑANA           ║
// ║   Copia lo que necesites — cada bloque dice DÓNDE va         ║
// ╚══════════════════════════════════════════════════════════════╝
//
// ESTRUCTURA DEL PROYECTO (recuérdala de memoria):
//
//   index.html
//   src/
//     main.js                  ← solo arranca el router
//     utils/
//       router.js              ← rutas y navegación SPA
//     services/
//       auth.js                ← sesión en localStorage
//       api.js                 ← fetch al json-server
//     views/
//       login.js
//       dashboard.js
//       projects.js
//       projectDetail.js
//     components/
//       navbar.js
//       loader.js
//     utils/
//       toast.js
//   db.json                    ← base de datos json-server
//
// ==============================================================


// ══════════════════════════════════════════════════════════════
// 1.  AUTH  →  va en:  src/services/auth.js
// ══════════════════════════════════════════════════════════════

const SESSION_KEY = "currentUser"; // nombre de la clave en localStorage

// Guarda el usuario al hacer login
export function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

// Lee el usuario guardado (devuelve null si no hay sesión)
export function getSession() {
  const stored = localStorage.getItem(SESSION_KEY);
  return stored ? JSON.parse(stored) : null;
}

// Borra la sesión (logout)
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ¿Hay alguien logueado?
export function isAuthenticated() {
  return getSession() !== null;
}

// ¿Es manager?
export function isManager() {
  const user = getSession();
  return user !== null && user.role === "manager";
}

// ¿Es collaborator?
export function isCollaborator() {
  const user = getSession();
  return user !== null && user.role === "collaborator";
}


// ══════════════════════════════════════════════════════════════
// 2.  ROUTER / GUARDIÁN DE RUTAS  →  va en:  src/utils/router.js
// ══════════════════════════════════════════════════════════════
//
// CÓMO FUNCIONA:
//   La URL usa el "#"  →  index.html#dashboard
//   Cuando cambia el hash se dispara "hashchange" y handleRoute()
//   lee el hash y decide qué vista renderizar.

import { isAuthenticated } from "../services/auth.js";
// (también importa las funciones renderXxx de cada vista)

const app = document.getElementById("app"); // contenedor principal

// Navega a una ruta cambiando el hash
export function navigate(route) {
  window.location.hash = route; // ej: navigate("#dashboard")
}

// Lógica del guardián + renderizado
export function handleRoute() {
  const hash = window.location.hash || "#login"; // ruta actual

  // ── GUARDIÁN ────────────────────────────────────────────
  // No logueado fuera del login → mandarlo a login
  if (!isAuthenticated() && hash !== "#login") {
    navigate("#login");
    return;
  }
  // Logueado intentando entrar a login → mandarlo al dashboard
  if (isAuthenticated() && hash === "#login") {
    navigate("#dashboard");
    return;
  }

  // ── EJEMPLO DE RUTA SOLO PARA MANAGER ───────────────────
  // (descomenta si en tu prueba hay una ruta exclusiva de manager)
  // if (!isManager() && hash === "#admin") {
  //   showToast("Solo los managers pueden acceder", "error");
  //   navigate("#dashboard");
  //   return;
  // }

  // ── DECIDIR QUÉ VISTA MOSTRAR ────────────────────────────
  // "project/3" → route = "project", param = "3"
  const [route, param] = hash.replace("#", "").split("/");
  app.innerHTML = ""; // limpiar antes de renderizar

  switch (route) {
    case "login":      renderLogin(app);                       break;
    case "dashboard":  renderDashboard(app);                   break;
    case "projects":   renderProjects(app);                    break;
    case "project":    renderProjectDetail(app, parseInt(param)); break;
    default:
      navigate(isAuthenticated() ? "#dashboard" : "#login");
  }
}

// Arranca el router (se llama una sola vez desde main.js)
export function initRouter() {
  window.addEventListener("hashchange", handleRoute); // navegación
  handleRoute();                                       // carga inicial
}


// ══════════════════════════════════════════════════════════════
// 3.  API  →  va en:  src/services/api.js
// ══════════════════════════════════════════════════════════════
//
// Cambia BASE_URL si el servidor corre en otro puerto.

const BASE_URL = "http://localhost:3000";

// ── LOGIN ────────────────────────────────────────────────────
export async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/users?email=${email}`);
  if (!res.ok) throw new Error("Error de servidor");
  const users = await res.json();
  return users.find((u) => u.password === password) || null;
}

// ── PROYECTOS ────────────────────────────────────────────────

// Todos los proyectos (solo manager)
export async function getAllProjects() {
  const res = await fetch(`${BASE_URL}/projects`);
  if (!res.ok) throw new Error("Error al obtener proyectos");
  return res.json();
}

// Proyectos de UN usuario (collaborator)
export async function getProjectsByUser(userId) {
  const res = await fetch(`${BASE_URL}/projects?assignedTo=${userId}`);
  if (!res.ok) throw new Error("Error al obtener proyectos");
  return res.json();
}

// Un proyecto por ID
export async function getProjectById(id) {
  const res = await fetch(`${BASE_URL}/projects/${id}`);
  if (!res.ok) throw new Error("Proyecto no encontrado");
  return res.json();
}

// Crear proyecto (POST)
export async function createProject(data) {
  const newProject = {
    ...data,
    createdAt: new Date().toISOString().split("T")[0], // "YYYY-MM-DD"
  };
  const res = await fetch(`${BASE_URL}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newProject),
  });
  if (!res.ok) throw new Error("Error al crear proyecto");
  return res.json(); // devuelve el proyecto con el id asignado
}

// Editar proyecto completo (PUT)
export async function updateProject(id, data) {
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar proyecto");
  return res.json();
}

// Cambiar SOLO el estado (PATCH)  ←  útil para collaborators
export async function updateProjectStatus(id, status) {
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }), // solo manda el campo que cambia
  });
  if (!res.ok) throw new Error("Error al cambiar estado");
  return res.json();
}

// Eliminar proyecto (DELETE)
export async function deleteProject(id) {
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar proyecto");
  // DELETE no devuelve body, no hacer .json()
}

// Todos los usuarios (para el selector de asignación)
export async function getAllUsers() {
  const res = await fetch(`${BASE_URL}/users`);
  if (!res.ok) throw new Error("Error al obtener usuarios");
  return res.json();
}


// ══════════════════════════════════════════════════════════════
// 4.  ESQUELETO DE VISTA  →  va en:  src/views/miVista.js
// ══════════════════════════════════════════════════════════════
//
// COPIA ESTO CADA VEZ QUE TENGAS QUE HACER UNA VISTA NUEVA.
// Solo cambia los imports y el contenido de renderMiVista.

import { getAllProjects } from "../services/api.js";
import { getSession, isManager } from "../services/auth.js";
import { renderNavbar } from "../components/navbar.js";
import { showLoader } from "../components/loader.js";
import { showToast } from "../utils/toast.js";
import { navigate } from "../utils/router.js";

export async function renderMiVista(container) {
  const user = getSession();

  // 1. Poner el HTML base con la navbar
  container.innerHTML = `
    <div class="page-wrapper">
      <main class="main-content" id="mi-contenido"></main>
    </div>
  `;
  renderNavbar(container.querySelector(".page-wrapper"));

  const content = document.getElementById("mi-contenido");
  showLoader(content); // muestra spinner mientras carga

  try {
    // 2. Pedir los datos al servidor
    const projects = await getAllProjects();

    // 3. Pintar el HTML con los datos
    content.innerHTML = `
      <h2>Hola ${user.name}</h2>
      <ul>
        ${projects.map((p) => `<li>${p.name} — ${p.status}</li>`).join("")}
      </ul>
    `;

    // 4. Agregar eventos a los botones/filas que necesites
    // document.getElementById("miBtn").addEventListener("click", () => { ... });

  } catch (error) {
    content.innerHTML = `<p>Error al cargar datos ⚠️</p>`;
    showToast("Error al cargar", "error");
    console.error(error);
  }
}


// ══════════════════════════════════════════════════════════════
// 5.  MODAL DE CONFIRMACIÓN (ej: "¿Seguro que deseas eliminar?")
//     →  va DENTRO de la vista donde lo necesites
// ══════════════════════════════════════════════════════════════

function mostrarModalConfirmacion(mensaje, onConfirmar) {
  // Crea el modal y lo agrega al body
  const modal = document.createElement("div");
  modal.className = "modal-overlay"; // asegúrate de tener este CSS
  modal.innerHTML = `
    <div class="modal">
      <p>${mensaje}</p>
      <div class="modal-actions">
        <button id="btn-cancelar" class="btn-secondary">Cancelar</button>
        <button id="btn-confirmar" class="btn-danger">Confirmar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Cerrar sin hacer nada
  document.getElementById("btn-cancelar").addEventListener("click", () => {
    modal.remove();
  });

  // Ejecutar la acción y cerrar
  document.getElementById("btn-confirmar").addEventListener("click", () => {
    modal.remove();
    onConfirmar(); // llama a la función que recibe como parámetro
  });
}

// USO:
// mostrarModalConfirmacion("¿Eliminar este proyecto?", async () => {
//   await deleteProject(id);
//   showToast("Eliminado", "success");
//   navigate("#projects");
// });


// ══════════════════════════════════════════════════════════════
// 6.  FILTRO / BÚSQUEDA EN LISTA
//     →  va DENTRO de la vista de lista (projects.js o similar)
// ══════════════════════════════════════════════════════════════
//
// Primero agrega esto en tu HTML:
//   <input id="buscador" type="text" placeholder="Buscar..." />
//   <select id="filtro-estado">
//     <option value="">Todos</option>
//     <option value="Pending">Pendiente</option>
//     <option value="In Progress">En progreso</option>
//     <option value="Completed">Completado</option>
//   </select>
//   <div id="lista-proyectos"></div>

function iniciarFiltros(todosLosProyectos) {
  const buscador      = document.getElementById("buscador");
  const filtroEstado  = document.getElementById("filtro-estado");
  const lista         = document.getElementById("lista-proyectos");

  function aplicarFiltros() {
    const texto  = buscador.value.toLowerCase();
    const estado = filtroEstado.value;

    const filtrados = todosLosProyectos.filter((p) => {
      const coincideTexto  = p.name.toLowerCase().includes(texto);
      const coincideEstado = estado === "" || p.status === estado;
      return coincideTexto && coincideEstado;
    });

    // Vuelve a pintar solo los filtrados
    lista.innerHTML = filtrados.length === 0
      ? `<p>No hay resultados</p>`
      : filtrados.map((p) => `
          <div class="project-row" data-id="${p.id}">
            <span>${p.name}</span>
            <span>${p.status}</span>
          </div>
        `).join("");
  }

  buscador.addEventListener("input", aplicarFiltros);
  filtroEstado.addEventListener("change", aplicarFiltros);
}

// USO (dentro de tu renderProjects, después de tener los datos):
// const projects = await getAllProjects();
// pintarListaInicial(projects);   // pinta la lista la primera vez
// iniciarFiltros(projects);       // activa los filtros en tiempo real


// ══════════════════════════════════════════════════════════════
// 7.  FORMULARIO CREATE / EDIT EN LA MISMA FUNCIÓN
//     →  va DENTRO de projects.js o en su propia vista
// ══════════════════════════════════════════════════════════════
//
// Si el parámetro "proyecto" viene → modo EDICIÓN
// Si viene null/undefined → modo CREACIÓN

async function mostrarFormulario(users, proyecto = null) {
  const esEdicion = proyecto !== null;

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal">
      <h3>${esEdicion ? "Editar proyecto" : "Nuevo proyecto"}</h3>

      <label>Nombre</label>
      <input id="f-nombre" type="text" value="${esEdicion ? proyecto.name : ""}"/>

      <label>Descripción</label>
      <textarea id="f-desc">${esEdicion ? proyecto.description : ""}</textarea>

      <label>Estado</label>
      <select id="f-estado">
        <option value="Pending"     ${esEdicion && proyecto.status === "Pending"     ? "selected" : ""}>Pendiente</option>
        <option value="In Progress" ${esEdicion && proyecto.status === "In Progress" ? "selected" : ""}>En progreso</option>
        <option value="Completed"   ${esEdicion && proyecto.status === "Completed"   ? "selected" : ""}>Completado</option>
      </select>

      <label>Asignar a</label>
      <select id="f-usuario">
        ${users.map((u) => `
          <option value="${u.id}" ${esEdicion && proyecto.assignedTo === u.id ? "selected" : ""}>
            ${u.name}
          </option>
        `).join("")}
      </select>

      <p id="f-error" style="color:red; display:none;"></p>

      <div class="modal-actions">
        <button id="f-cancelar" class="btn-secondary">Cancelar</button>
        <button id="f-guardar"  class="btn-primary">${esEdicion ? "Guardar" : "Crear"}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById("f-cancelar").addEventListener("click", () => {
    modal.remove();
  });

  document.getElementById("f-guardar").addEventListener("click", async () => {
    const data = {
      name:        document.getElementById("f-nombre").value.trim(),
      description: document.getElementById("f-desc").value.trim(),
      status:      document.getElementById("f-estado").value,
      assignedTo:  parseInt(document.getElementById("f-usuario").value),
    };

    // Validación mínima
    if (!data.name) {
      document.getElementById("f-error").textContent = "El nombre es obligatorio";
      document.getElementById("f-error").style.display = "block";
      return;
    }

    try {
      if (esEdicion) {
        await updateProject(proyecto.id, data);
        showToast("Proyecto actualizado", "success");
      } else {
        await createProject(data);
        showToast("Proyecto creado", "success");
      }
      modal.remove();
      navigate("#projects"); // recarga la vista
    } catch (err) {
      showToast("Error al guardar", "error");
    }
  });
}


// ══════════════════════════════════════════════════════════════
// 8.  LOGOUT  →  va en:  src/components/navbar.js
//     (o donde tengas el botón de cerrar sesión)
// ══════════════════════════════════════════════════════════════

import { clearSession } from "../services/auth.js";

function configurarLogout() {
  // Asegúrate de que tu navbar tenga un botón con id="logout-btn"
  const btn = document.getElementById("logout-btn");
  if (!btn) return; // por si la navbar aún no está en el DOM

  btn.addEventListener("click", () => {
    clearSession();     // borra localStorage
    navigate("#login"); // manda al login
  });
}

// Llama a esta función dentro de renderNavbar(), después de poner el innerHTML


// ══════════════════════════════════════════════════════════════
// 9.  TOAST (notificación rápida)
//     →  ya viene hecho en  src/utils/toast.js
//     Solo importa showToast y úsalo así:
// ══════════════════════════════════════════════════════════════

// import { showToast } from "../utils/toast.js";

// showToast("Mensaje de éxito", "success");
// showToast("Algo salió mal",   "error");
// showToast("Aviso importante", "warning");


// ══════════════════════════════════════════════════════════════
// 10. LOADER (spinner de carga)
//     →  ya viene hecho en  src/components/loader.js
// ══════════════════════════════════════════════════════════════

// import { showLoader } from "../components/loader.js";

// Úsalo ANTES de hacer el fetch:
// showLoader(content);
// Después del fetch el innerHTML del content se reemplaza y el loader desaparece solo.


// ══════════════════════════════════════════════════════════════
// 11. AGREGAR UNA NUEVA RUTA (checklist paso a paso)
// ══════════════════════════════════════════════════════════════
//
//  1. Crea  src/views/miNuevaVista.js  con  export async function renderMiNuevaVista(container) { ... }
//  2. En router.js:
//       import { renderMiNuevaVista } from "../views/miNuevaVista.js";
//       // y dentro del switch:
//       case "mi-ruta":  renderMiNuevaVista(app);  break;
//  3. Para navegar a ella desde cualquier parte:
//       navigate("#mi-ruta");
//  4. Si debe ser solo para manager, agrega el guardián en handleRoute():
//       if (!isManager() && hash === "#mi-ruta") { navigate("#dashboard"); return; }


// ══════════════════════════════════════════════════════════════
// 12. db.json MÍNIMO (por si tienes que crearlo desde cero)
//     →  va en la raíz del proyecto
// ══════════════════════════════════════════════════════════════
//
// {
//   "users": [
//     { "id": 1, "name": "Ana García",   "email": "manager@test.com", "password": "123456", "role": "manager"      },
//     { "id": 2, "name": "Carlos López", "email": "user@test.com",    "password": "123456", "role": "collaborator" }
//   ],
//   "projects": [
//     { "id": 1, "name": "Mi proyecto", "description": "Descripción", "status": "Pending", "createdAt": "2025-01-01", "assignedTo": 2 }
//   ]
// }
//
// Arranca el servidor con:
//   npx json-server --watch db.json --port 3000
