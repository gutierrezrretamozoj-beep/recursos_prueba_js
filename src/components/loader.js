// ============================================================
// src/components/loader.js
// Componente de carga (spinner).
// Se muestra mientras esperamos respuesta del servidor.
// ============================================================

/**
 * Muestra un spinner de carga en el contenedor indicado.
 * Reemplaza el contenido actual del contenedor.
 *
 * @param {HTMLElement} container - Dónde mostrar el loader
 */
export function showLoader(container) {
  container.innerHTML = `
    <div class="loader-wrapper">
      <div class="spinner"></div>
      <p class="loader-text">Cargando...</p>
    </div>
  `;
}

/**
 * Elimina el loader del contenedor.
 * Llamar esto cuando los datos ya están listos.
 *
 * @param {HTMLElement} container
 */
export function hideLoader(container) {
  const loader = container.querySelector(".loader-wrapper");
  if (loader) loader.remove();
}
