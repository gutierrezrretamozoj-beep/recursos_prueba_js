# [PROJECT_NAME] 

> [SHORT_DESCRIPTION — one sentence explaining what the app does]

---

## Table of Contents

- [About](#about)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Roles & Permissions](#roles--permissions)
- [Test Credentials](#test-credentials)
- [Contributing](#contributing)

---

## About

[PROJECT_NAME] is a Single Page Application built to [EXPLAIN_THE_PURPOSE].  
It allows users to [MAIN_FEATURE_1], [MAIN_FEATURE_2], and [MAIN_FEATURE_3].

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | Vanilla JS + Vite                   |
| Routing     | Hash-based SPA router (custom)      |
| Backend     | json-server                         |
| Auth        | localStorage session                |
| Styles      | [CSS_FRAMEWORK_OR_PLAIN_CSS]        |

---

## Getting Started

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/) v[NODE_VERSION] or higher
- npm v[NPM_VERSION] or higher

### Installation

1. Clone the repository:

```bash
git clone https://github.com/[YOUR_USERNAME]/[REPO_NAME].git
cd [REPO_NAME]
```

2. Install dependencies:

```bash
npm install
```

3. Start the database server (Terminal 1):

```bash
npx json-server --watch db.json --port [DB_PORT]
```

4. Start the development server (Terminal 2):

```bash
npm run dev
```

5. Open your browser at:

```
http://localhost:[VITE_PORT]
```

> NOTE: Both servers must be running at the same time.

---

## Project Structure

```
[REPO_NAME]/
├── index.html
├── db.json                     ← mock database
├── package.json
└── src/
    ├── main.js                 ← entry point
    ├── services/
    │   ├── api.js              ← all fetch calls
    │   └── auth.js             ← session management
    ├── views/
    │   ├── login.js
    │   ├── dashboard.js
    │   ├── [VIEW_NAME].js
    │   └── [VIEW_NAME].js
    ├── components/
    │   ├── navbar.js
    │   └── loader.js
    └── utils/
        ├── router.js           ← SPA navigation
        └── toast.js            ← notifications
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts Vite development server |
| `npm run build` | Builds the app for production |
| `npx json-server --watch db.json --port [DB_PORT]` | Starts the mock API |

---

## Environment Variables

> Only needed if you move away from json-server.

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL of the API | `http://localhost:[DB_PORT]` |

---

## API Endpoints

Base URL: `http://localhost:[DB_PORT]`

| Method | Endpoint | Description | Auth required |
|--------|----------|-------------|---------------|
| GET | `/users?email=[EMAIL]` | Find user by email | No |
| GET | `/[RESOURCE]` | Get all [RESOURCE] | Yes |
| GET | `/[RESOURCE]/:id` | Get [RESOURCE] by ID | Yes |
| POST | `/[RESOURCE]` | Create new [RESOURCE] | Manager only |
| PUT | `/[RESOURCE]/:id` | Full update | Manager only |
| PATCH | `/[RESOURCE]/:id` | Partial update | Yes |
| DELETE | `/[RESOURCE]/:id` | Delete [RESOURCE] | Manager only |

---

## Roles & Permissions

| Action | Manager | Collaborator |
|--------|---------|--------------|
| View all [RESOURCE] | Yes | No |
| View own [RESOURCE] | Yes | Yes |
| Create [RESOURCE] | Yes | No |
| Edit [RESOURCE] | Yes | No |
| Delete [RESOURCE] | Yes | No |
| Change status | Yes | Yes |

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Manager | [MANAGER_EMAIL] | [PASSWORD] |
| Collaborator | [COLLABORATOR_EMAIL] | [PASSWORD] |

---

## Routes

| Hash | View | Access |
|------|------|--------|
| `#login` | Login page | Public |
| `#dashboard` | Main dashboard | All users |
| `#[ROUTE_NAME]` | [DESCRIPTION] | All users |
| `#[ROUTE_NAME]` | [DESCRIPTION] | Manager only |
| `#[ROUTE_NAME]/:id` | [DESCRIPTION] detail | All users |

---

## Contributing

1. Fork the project
2. Create your branch: `git checkout -b feature/[FEATURE_NAME]`
3. Commit your changes: `git commit -m 'Add [FEATURE_NAME]'`
4. Push to the branch: `git push origin feature/[FEATURE_NAME]`
5. Open a Pull Request

---

## Author

**[YOUR_NAME]**  
[YOUR_EMAIL]  
[YOUR_GITHUB_URL]

---

## License

This project is for educational purposes — [INSTITUTION_NAME] · [YEAR]
