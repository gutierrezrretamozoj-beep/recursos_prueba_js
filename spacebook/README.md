# SpaceBook – Corporate Space Booking SPA

A Single Page Application for managing shared workspace reservations, built with Vanilla JavaScript (ES Modules, no framework).

---

## Description

SpaceBook lets employees book shared spaces (meeting rooms, private offices, coworking areas, auditoriums) and lets admins manage all reservations and spaces. It features role-based access control, SPA routing, and session persistence.

---

## Technologies Used

| Technology      | Purpose                          |
|-----------------|----------------------------------|
| Vanilla JS (ES Modules) | Logic, DOM manipulation, routing |
| HTML5 / CSS3    | Structure and styling            |
| Hash routing    | SPA navigation without reload    |
| localStorage    | Session persistence              |
| In-memory DB    | Simulates json-server endpoints  |

> **Note:** `src/api/db.js` simulates json-server using in-memory arrays. To connect a real json-server, replace the helper functions in that file with `fetch()` calls to `http://localhost:3000`.

---

## Project Structure

```
spacebook/
├── index.html              # Main HTML — layout, modals, entry point
├── public/
│   └── styles.css          # All styles (variables, layout, components)
└── src/
    ├── main.js             # Bootstrap, route registration, event wiring
    ├── api/
    │   └── db.js           # In-memory database + CRUD helpers
    ├── auth/
    │   └── auth.js         # Login, logout, localStorage session
    ├── router/
    │   └── router.js       # Hash-based SPA router with role guards
    ├── components/
    │   ├── sidebar.js      # Sidebar nav + logout button
    │   ├── modal.js        # Open/close modal helpers
    │   └── toast.js        # Temporary notification toasts
    └── pages/
        ├── login.js        # Login form logic
        ├── dashboard.js    # Admin stats dashboard
        ├── reservas.js     # Reservations CRUD (full)
        └── espacios.js     # Spaces CRUD (admin only)
```

---

## Installation

No build step needed — the project uses native ES Modules.

```bash
# Clone or unzip the project
cd spacebook

# Serve with any static server (required for ES Modules — can't open index.html directly)
npx serve .
# or
npx http-server .
# or
python3 -m http.server 8080
```

Then open `http://localhost:3000` (or whichever port your server uses).

---

## Running json-server (optional — for real API)

```bash
npm install -g json-server
json-server --watch db.json --port 3000
```

**db.json** should mirror the structure in `src/api/db.js`:
```json
{
  "users":    [],
  "espacios": [],
  "reservas": []
}
```

To switch from in-memory to json-server, replace the helper functions in `src/api/db.js` with `fetch()` calls.

---

## Test Users

| Role  | Email           | Password  |
|-------|-----------------|-----------|
| Admin | admin@test.com  | Admin123* |
| User  | user1@test.com  | User123*  |
| User  | user2@test.com  | User123*  |

---

## Role Permissions

| Feature                        | Admin | User (own only) |
|--------------------------------|:-----:|:---------------:|
| View all reservations          | ✅    | ❌              |
| View own reservations          | ✅    | ✅              |
| Create reservation             | ✅    | ✅              |
| Edit pending reservation       | ✅    | ✅ (own)        |
| Edit any reservation           | ✅    | ❌              |
| Approve / Reject reservations  | ✅    | ❌              |
| Cancel reservation             | ✅    | ✅ (own)        |
| Delete reservation             | ✅    | ❌              |
| Manage spaces (CRUD)           | ✅    | ❌              |
| Dashboard stats                | ✅    | ❌              |

---

## Technical Decisions

- **ES Modules (no bundler):** keeps the project simple and dependency-free. Every file is a standard JS module with `import`/`export`.
- **Hash routing** (`#page`): works on any static server without server-side configuration. The `router.js` module maps hashes to render functions and role guards.
- **In-memory DB in `db.js`:** mirrors the json-server REST contract so swapping to a real API requires only changing `db.js`, not the pages.
- **`localStorage` for session:** the user stays logged in after a page refresh. On logout, the key is removed completely.
- **Role guards in the router:** `navigateTo()` checks `allowedRoles` before rendering. Any unauthorized navigation shows a toast and redirects automatically.
- **Event delegation:** table row buttons use `data-action` attributes and a single parent listener, avoiding memory leaks from attaching many individual handlers.
- **Business rules enforced on save:** duplicate booking detection, state-based edit locks, and owner-only mutations are all validated before writing to the DB.
