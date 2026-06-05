// ============================================================
// src/services/api.js
// Centraliza TODAS las llamadas a json-server (http://localhost:3000)
// Si necesitas cambiar la URL base, solo la cambias aquí.
// ============================================================

// URL base del servidor json-server
const BASE_URL = "http://localhost:3000";

// ─────────────────────────────────────────
// USUARIOS
// ─────────────────────────────────────────

/**
 * Busca un usuario por email y contraseña.
 * json-server no tiene login real, así que filtramos por email
 * y luego verificamos la contraseña en el cliente.
 *
 * @param {string} email
 * @param {string} password
 * @returns {object|null} El usuario encontrado, o null si no existe
 */
export async function loginUser(email, password) {
  // GET /users?email=xxx  → devuelve array con los usuarios que coinciden
  const response = await fetch(`${BASE_URL}/users?email=${email}`);

  // Si la petición falla (ej: servidor apagado), lanzamos error
  if (!response.ok) throw new Error("Error al conectar con el servidor");

  const users = await response.json();

  // Buscamos el usuario que además tenga la contraseña correcta
  const user = users.find((u) => u.password === password);

  // Retornamos el usuario (o undefined si no coincide la contraseña)
  return user || null;
}

// ─────────────────────────────────────────
// PROYECTOS
// ─────────────────────────────────────────

/**
 * Obtiene TODOS los proyectos del servidor.
 * Solo el Manager debería llamar esta función.
 *
 * @returns {Array} Lista de todos los proyectos
 */
export async function getAllProjects() {
  const response = await fetch(`${BASE_URL}/projects`);
  if (!response.ok) throw new Error("Error al obtener proyectos");
  return response.json(); // .json() parsea el body como JSON automáticamente
}

/**
 * Obtiene solo los proyectos asignados a un usuario específico.
 * Usada por los Collaborators.
 *
 * @param {number} userId - ID del colaborador
 * @returns {Array} Proyectos donde assignedTo === userId
 */
export async function getProjectsByUser(userId) {
  // Filtramos directamente en la URL con json-server
  const response = await fetch(`${BASE_URL}/projects?assignedTo=${userId}`);
  if (!response.ok) throw new Error("Error al obtener proyectos");
  return response.json();
}

/**
 * Obtiene un proyecto específico por su ID.
 *
 * @param {number} id - ID del proyecto
 * @returns {object} El proyecto encontrado
 */
export async function getProjectById(id) {
  const response = await fetch(`${BASE_URL}/projects/${id}`);
  if (!response.ok) throw new Error("Proyecto no encontrado");
  return response.json();
}

/**
 * Crea un nuevo proyecto.
 * Solo el Manager puede hacer esto.
 *
 * @param {object} projectData - { name, description, status, assignedTo }
 * @returns {object} El proyecto recién creado (con su nuevo id)
 */
export async function createProject(projectData) {
  // Agregamos la fecha de creación automáticamente
  const newProject = {
    ...projectData,
    createdAt: new Date().toISOString().split("T")[0], // Formato "YYYY-MM-DD"
  };

  const response = await fetch(`${BASE_URL}/projects`, {
    method: "POST", // POST para crear
    headers: { "Content-Type": "application/json" }, // Le decimos al server que mandamos JSON
    body: JSON.stringify(newProject), // Convertimos el objeto a string JSON
  });

  if (!response.ok) throw new Error("Error al crear proyecto");
  return response.json();
}

/**
 * Actualiza un proyecto completo (todos los campos).
 * Solo el Manager puede hacer esto.
 *
 * @param {number} id - ID del proyecto a editar
 * @param {object} projectData - Datos actualizados
 * @returns {object} El proyecto actualizado
 */
export async function updateProject(id, projectData) {
  const response = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "PUT", // PUT reemplaza todo el objeto
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) throw new Error("Error al actualizar proyecto");
  return response.json();
}

/**
 * Actualiza SOLO el estado de un proyecto.
 * Los Collaborators pueden usar esto en sus propios proyectos.
 *
 * @param {number} id - ID del proyecto
 * @param {string} status - Nuevo estado
 * @returns {object} El proyecto con el estado actualizado
 */
export async function updateProjectStatus(id, status) {
  const response = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "PATCH", // PATCH actualiza solo los campos enviados
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }), // Solo enviamos el campo status
  });

  if (!response.ok) throw new Error("Error al actualizar estado");
  return response.json();
}

/**
 * Elimina un proyecto por su ID.
 * Solo el Manager puede hacer esto.
 *
 * @param {number} id - ID del proyecto a eliminar
 */
export async function deleteProject(id) {
  const response = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "DELETE", // DELETE elimina el recurso
  });

  if (!response.ok) throw new Error("Error al eliminar proyecto");
  // DELETE no devuelve body, así que no hacemos .json()
}

/**
 * Obtiene todos los usuarios (para el selector de responsable en formularios).
 *
 * @returns {Array} Lista de usuarios
 */
export async function getAllUsers() {
  const response = await fetch(`${BASE_URL}/users`);
  if (!response.ok) throw new Error("Error al obtener usuarios");
  return response.json();
}
