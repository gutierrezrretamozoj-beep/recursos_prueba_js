import { usersAPI } from '../api/db.js';

// ── Persistencia de sesión en localStorage ──

export function saveSession(user) {
  localStorage.setItem('session', JSON.stringify(user));
}

export function loadSession() {
  const s = localStorage.getItem('session');
  return s ? JSON.parse(s) : null;
}

export function clearSession() {
  localStorage.removeItem('session');
}

// ── Login: valida credenciales contra la DB ──
export function authenticate(email, password) {
  return usersAPI.findByCredentials(email, password); // null si no existe
}

// ── Recuperar usuario de sesión guardada ──
export function restoreSession() {
  const session = loadSession();
  if (!session) return null;
  // Re-validar que el usuario sigue existiendo en DB
  return usersAPI.findById(session.id) || null;
}
