// ============================================================
// src/main.js
// Punto de entrada de la aplicación.
// Solo hace UNA cosa: inicializar el router.
// El router se encarga del resto.
// ============================================================

import { initRouter } from "./utils/router.js";

// Cuando el DOM esté completamente cargado, iniciamos el router.
// DOMContentLoaded garantiza que el elemento #app ya existe en el HTML.
document.addEventListener("DOMContentLoaded", () => {
  initRouter();
});
