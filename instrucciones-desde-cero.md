# 🚀 Instrucciones desde cero — SPA con Vite + json-server

> Tienes una base dada. Sigue estos pasos EN ORDEN.

---

## PASO 1 — Instalar dependencias

Abre la terminal en la carpeta del proyecto y corre:

```bash
npm install
```

Si no hay `package.json` o falla, crea el proyecto tú mismo:

```bash
npm create vite@latest nombre-proyecto -- --template vanilla
cd nombre-proyecto
npm install
```

---

## PASO 2 — Revisar que exista db.json

Debe estar en la **raíz** del proyecto (al lado de `package.json`).

Si no existe, créalo con esto mínimo:

```json
{
  "users": [
    { "id": 1, "name": "Ana García",   "email": "manager@test.com", "password": "123456", "role": "manager"      },
    { "id": 2, "name": "Carlos López", "email": "user@test.com",    "password": "123456", "role": "collaborator" }
  ],
  "projects": [
    { "id": 1, "name": "Proyecto 1", "description": "Descripción", "status": "Pending", "createdAt": "2025-01-01", "assignedTo": 2 }
  ]
}
```

---

## PASO 3 — Arrancar los dos servidores

Necesitas **dos terminales abiertas al mismo tiempo**:

**Terminal 1 — base de datos:**
```bash
npx json-server --watch db.json --port 3000
```
✅ Debe decir: `Resources → http://localhost:3000/users`

**Terminal 2 — Vite (la app):**
```bash
npm run dev
```
✅ Debe decir: `Local → http://localhost:5173`

Abre el navegador en `http://localhost:5173`

---

## PASO 4 — Revisar la estructura de carpetas

Asegúrate de que existan estas carpetas y archivos:

```
proyecto/
├── index.html
├── db.json
├── package.json
└── src/
    ├── main.js
    ├── services/
    │   ├── api.js        ← fetch al servidor
    │   └── auth.js       ← sesión en localStorage
    ├── views/
    │   ├── login.js
    │   ├── dashboard.js
    │   └── projects.js
    ├── components/
    │   ├── navbar.js
    │   └── loader.js
    └── utils/
        ├── router.js     ← navegación SPA
        └── toast.js      ← notificaciones
```

Si falta alguna carpeta:
```bash
mkdir -p src/services src/views src/components src/utils
```

---

## PASO 5 — Verificar index.html

Debe tener un `<div id="app">` y el script apuntando a `main.js`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Mi App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

> ⚠️ El `type="module"` es obligatorio para que funcionen los `import/export`

---

## PASO 6 — Verificar main.js

Solo debe tener esto:

```js
// src/main.js
import { initRouter } from "./utils/router.js";

document.addEventListener("DOMContentLoaded", () => {
  initRouter();
});
```

---

## PASO 7 — Orden para crear archivos nuevos

Cuando te pidan agregar algo nuevo, siempre en este orden:

```
1. api.js       → agrega la función fetch que necesites
2. auth.js      → solo si hay algo nuevo de sesión/roles
3. miVista.js   → crea el archivo de la vista nueva
4. router.js    → importa la vista y agrega el case en el switch
```

---

## PASO 8 — Agregar una vista nueva (checklist)

**Ejemplo: agregar una vista "reportes" solo para managers**

**1. Crea el archivo** `src/views/reportes.js`:
```js
import { getSession } from "../services/auth.js";
import { renderNavbar } from "../components/navbar.js";
import { navigate } from "../utils/router.js";

export async function renderReportes(container) {
  const user = getSession();

  container.innerHTML = `
    <div class="page-wrapper">
      <main class="main-content" id="reportes-content"></main>
    </div>
  `;
  renderNavbar(container.querySelector(".page-wrapper"));

  const content = document.getElementById("reportes-content");
  content.innerHTML = `<h2>Reportes — solo para managers</h2>`;
}
```

**2. En `router.js`** agrega el import arriba:
```js
import { renderReportes } from "../views/reportes.js";
```

**3. En `handleRoute()`** agrega el guardián (si es solo para manager):
```js
if (!isManager() && hash === "#reportes") {
  navigate("#dashboard");
  return;
}
```

**4. En el `switch`** agrega el case:
```js
case "reportes":  renderReportes(app);  break;
```

**5. Para navegar a ella** desde cualquier botón:
```js
navigate("#reportes");
```

---

## PASO 9 — Errores frecuentes y cómo arreglarlos

| Error | Causa | Solución |
|-------|-------|----------|
| Pantalla en blanco | `main.js` no importa el router | Revisar `import { initRouter }` |
| "Cannot GET /users" | json-server no está corriendo | Abrir terminal 1 y correr el comando del paso 3 |
| El login no redirige | Falta `saveSession` antes de `navigate` | Revisar orden en login.js |
| La ruta no carga | Falta el `case` en el switch del router | Revisar router.js |
| "404 Not Found" en fetch | URL mal escrita en api.js | Revisar `BASE_URL` y el endpoint |
| Sesión se pierde al recargar | Se guardó con `sessionStorage` en vez de `localStorage` | Cambiar a `localStorage` en auth.js |
| El guardián no funciona | `isAuthenticated()` no se importó en router.js | Revisar los imports arriba del router |

---

## PASO 10 — Flujo completo de la app (para tenerlo claro)

```
Usuario abre la app
  → main.js llama initRouter()
    → handleRoute() lee el hash de la URL
      → ¿Está logueado? (revisa localStorage)
        NO → renderLogin()
        SÍ → renderDashboard() (o la ruta que corresponda)

Usuario hace login
  → loginUser() hace fetch a json-server
    → Encuentra el usuario → saveSession() → navigate("#dashboard")
    → No lo encuentra    → muestra error en pantalla

Usuario navega (click en un enlace)
  → navigate("#projects") cambia el hash
    → hashchange dispara handleRoute()
      → switch decide qué vista renderizar
        → renderProjects() limpia el #app y pinta la nueva vista
```

---

## RESUMEN en 30 segundos

```bash
# 1. Instalar
npm install

# 2. Terminal 1 — base de datos
npx json-server --watch db.json --port 3000

# 3. Terminal 2 — app
npm run dev

# 4. Abrir navegador
http://localhost:5173
```

**Regla de oro:** cada vista nueva = 1 archivo + 1 import en router + 1 case en el switch. Siempre igual.
