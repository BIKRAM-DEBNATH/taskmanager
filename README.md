# TeamFlow - Professional Team Task Manager

<p align="center">
  <img src="https://img.shields.io/github/stars/owner/team-task-manager?style=social" alt="Stars">
  <img src="https://img.shields.io/github/forks/owner/team-task-manager?style=social" alt="Forks">
  <img src="https://img.shields.io/github/issues/owner/team-task-manager" alt="Issues">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
  <img src="https://img.shields.io/badge/Backend-Node_Express_MongoDB-43853d" alt="Backend">
  <img src="https://img.shields.io/badge/Frontend-React_Vite-61dafb" alt="Frontend">
</p>

---

## Overview

TeamFlow is a full-stack team task management application built with the **MERN stack** (MongoDB, Express.js, React, Node.js). It provides role-based access control (Admin/User), project/task management, real-time dashboards, and seamless deployment options.

### Key Benefits

- Zero hardcoded URLs/secrets – all via environment variables
- Production-ready with CORS handling, JWT auth, SPA routing fixes
- One-click deploys to Render, Vercel, Netlify + more

---

## Features

| Feature | Description |
|---------|-------------|
| **Authentication** | Secure signup/login with JWT tokens and role-based guards (Admin/User) |
| **Projects** | CRUD operations (Admin-only create/edit/delete), list/view projects |
| **Tasks** | Full CRUD, stats dashboard, assign to projects/users |
| **Users** | Admin dashboard to manage users, assign roles |
| **Dashboard** | Overview with task stats and quick actions |
| **Responsive UI** | Modern React components with sidebar navigation |
| **Deployment-Ready** | Pre-configured for Vercel, Render, Netlify |

---

## Quick Start

```bash
# Clone & Install
git clone <repo> team-task-manager
cd team-task-manager

# Backend (Terminal 1)
cd backend
npm install
# Copy .env.example to .env and edit (MongoDB URI, JWT_SECRET, etc.)
npm run dev  # http://localhost:5000

# Frontend (Terminal 2)
cd ../frontend
npm install
npm run dev  # http://localhost:5173
```

> **Note:** First user auto-registers as **Admin**.

---

## Project Structure

```
team-task-manager/
├── backend/                    # Node/Express API
│   ├── controllers/            # Business logic
│   ├── middleware/            # Auth/roles
│   ├── models/                 # Mongoose (User, Project, Task)
│   ├── routes/                 # API endpoints
│   ├── server.js              # Entry point
│   ├── package.json
│   ├── vercel.json            # Deployment config
│   └── package-lock.json
├── frontend/                   # React/Vite SPA
│   ├── public/
│   │   └── _redirects         # Netlify routing
│   ├── src/
│   │   ├── api/               # Axios config
│   │   ├── components/        # UI (Sidebar, etc.)
│   │   ├── context/           # AuthContext
│   │   ├── pages/             # Views (Dashboard, Projects, Tasks...)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json
│   └── package.json
├── README.md
├── render.yaml                 # Render blueprint
└── .gitignore
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|--------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGO_URI` | MongoDB Atlas/Local URI | `mongodb://localhost:27017/db` |
| `JWT_SECRET` | Token signing secret (32+ chars) | `supersecretkeyhere` |
| `CLIENT_URL` | Allowed frontend origins (CSV) | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|--------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000` |

---

## Development

| Component | Command |
|-----------|---------|
| Backend | `npm run dev` (Nodemon) |
| Frontend | Vite dev server with `/api` proxy to backend |

> **Requirement:** MongoDB (local or Atlas)

---

## Deployment

### Render (Recommended - Full Stack)

1. Push to GitHub
2. [Render.com](https://render.com) → New Blueprint → Select repo
3. Set env vars post-deploy:
   - Backend: `MONGO_URI`, `CLIENT_URL=https://frontend.onrender.com`
   - Frontend: `VITE_API_URL=https://backend.onrender.com`
4. Auto-deploys on push

### Vercel

```bash
# Backend
cd backend && vercel --prod
# Frontend
cd frontend && vercel --prod  # Set VITE_API_URL first
```

### Netlify (Frontend) + Railway/Heroku (Backend)

1. Backend: Deploy to Railway, set env vars
2. Frontend: Drag-drop `frontend/dist` (after `npm run build`), add `VITE_API_URL`

> SPA routing handled automatically

---

## API Reference

All endpoints prefixed with `/api`.

### Authentication

| Method | Endpoint | Access |
|--------|----------|--------|
| `POST` | `/auth/signup` | Public |
| `POST` | `/auth/login` | Public |
| `GET` | `/auth/me` | Private |

### Projects

| Method | Endpoint | Access |
|--------|----------|--------|
| `GET` | `/projects` | Private |
| `POST` | `/projects` | Admin |
| `GET` | `/projects/:id` | Private |
| `PUT` | `/projects/:id` | Admin |
| `DELETE` | `/projects/:id` | Admin |

### Tasks

| Method | Endpoint | Access |
|--------|----------|--------|
| `GET` | `/tasks` | Private |
| `GET` | `/tasks/stats` | Private |
| `POST` | `/tasks` | Admin |
| `GET` | `/tasks/:id` | Private |
| `PUT` | `/tasks/:id` | Private |
| `DELETE` | `/tasks/:id` | Admin |

### Users (Admin Only)

| Method | Endpoint | Access |
|--------|----------|--------|
| `GET` | `/users` | Admin |
| `PUT` | `/users/:id/role` | Admin |
| `DELETE` | `/users/:id` | Admin |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **CORS Error** | Add origin to backend `CLIENT_URL` (comma-separated), restart/redeploy backend |
| **SPA 404 on Refresh** | Handled by platform configs (`vercel.json`, `_redirects`, etc.) |
| **No .env.example** | Create manually using tables above |

---

## Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit: `git commit -m 'Add AmazingFeature'`
4. Push & PR

> Issues? [Open one](https://github.com/owner/team-task-manager/issues)

---

<p align="center">Built with ❤️ for modern teams</p>

<p align="center">Questions? mail-bikramdebnath905@gmail.com</p>