// ============================================================
// src/utils/toast.js
// Sistema de notificaciones tipo "toast" (mensajes temporales).
// Aparecen en la esquina inferior derecha y desaparecen solos.
// ============================================================

/**
 * Muestra una notificación toast en pantalla.
 *
 * @param {string} message - El texto del mensaje
 * @param {string} type    - "success" | "error" | "info" (afecta el color)
 * @param {number} duration - Milisegundos antes de desaparecer (default: 3000)
 */
export function showToast(message, type = "info", duration = 3000) {
  // ── Crear el contenedor de toasts si no existe ───────────
  // Buscamos el contenedor; si no existe, lo creamos y lo añadimos al body
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    // Posicionamos en la esquina inferior derecha con CSS inline
    container.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 9999;
    `;
    document.body.appendChild(container);
  }

  // ── Crear el toast ───────────────────────────────────────
  const toast = document.createElement("div");

  // Colores según el tipo de mensaje
  const colors = {
    success: "#10b981", // verde
    error: "#ef4444",   // rojo
    info: "#3b82f6",    // azul
  };

  toast.style.cssText = `
    background: ${colors[type] || colors.info};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    opacity: 0;
    transform: translateX(20px);
    transition: all 0.3s ease;
    max-width: 320px;
    cursor: pointer;
  `;
  toast.textContent = message;

  // Añadimos al contenedor
  container.appendChild(toast);

  // Animación de entrada: esperamos un frame para que la transición funcione
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(0)";
  });

  // ── Auto-eliminar después del tiempo indicado ────────────
  const removeToast = () => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px)";
    // Esperamos a que termine la animación antes de eliminar del DOM
    setTimeout(() => toast.remove(), 300);
  };

  setTimeout(removeToast, duration);

  // También se puede cerrar haciendo click
  toast.addEventListener("click", removeToast);
}
