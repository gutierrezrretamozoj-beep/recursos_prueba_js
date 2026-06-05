// ============================================================
// src/services/auth.js
// Maneja TODO lo relacionado con la sesión del usuario:
// guardar, leer, eliminar y verificar permisos.
// Usamos localStorage para que la sesión persista aunque
// el usuario cierre y vuelva a abrir el navegador.
// ============================================================

// Clave que usaremos en localStorage para guardar el usuario
const SESSION_KEY = "currentUser";

/**
 * Guarda el usuario en localStorage al hacer login.
 * Usamos JSON.stringify porque localStorage solo guarda strings.
 *
 * @param {object} user - El objeto usuario completo
 */
export function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

/**
 * Lee el usuario guardado en localStorage.
 * Si no hay sesión activa, devuelve null.
 *
 * @returns {object|null} El usuario guardado, o null
 */
export function getSession() {
  const stored = localStorage.getItem(SESSION_KEY);
  // Si no existe la clave, stored es null, y JSON.parse(null) retorna null
  return stored ? JSON.parse(stored) : null;
}

/**
 * Elimina la sesión del usuario (logout).
 * removeItem borra la clave de localStorage completamente.
 */
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Verifica si hay un usuario con sesión activa.
 *
 * @returns {boolean} true si hay sesión, false si no
 */
export function isAuthenticated() {
  return getSession() !== null;
}

/**
 * Verifica si el usuario actual es Manager.
 * Útil para mostrar/ocultar botones o redireccionar.
 *
 * @returns {boolean}
 */
export function isManager() {
  const user = getSession();
  return user !== null && user.role === "manager";
}

/**
 * Verifica si el usuario actual es Collaborator.
 *
 * @returns {boolean}
 */
export function isCollaborator() {
  const user = getSession();
  return user !== null && user.role === "collaborator";
}
