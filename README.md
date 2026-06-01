# Aurvelia — MERN Portfolio Store

A full-stack e-commerce portfolio application built with the MERN stack, demonstrating product browsing, cart management, wishlists, orders, reviews, newsletters, and an admin dashboard.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, TanStack Router, TanStack React Query |
| **UI** | Tailwind CSS, Radix UI primitives, Lucide React icons |
| **Backend** | Node.js, Express, Mongoose, JWT (`jsonwebtoken`), `bcryptjs` |
| **Database** | MongoDB Atlas |
| **Dev Tools** | Nodemon (backend), Vite HMR (frontend) |

---

## Features

- **Product Catalog** — browsable product list with detail pages
- **Authentication** — register, login, and `/auth/me` via JWT (stored in `localStorage`)
- **Cart** — add, list, and update items
- **Wishlist** — add, list, and remove items
- **Orders** — create and list orders; subtotal and order number computed server-side
- **Reviews** — list and submit product reviews
- **Newsletter & Contact** — subscription and contact form endpoints
- **Admin Dashboard** — stats, orders, reviews, messages, and subscriber management

---

## Repository Structure

```
aurvelia-glow-forge-main/
├── src/               # Frontend source (React + Vite)
├── backend/           # Express API + Mongoose models
│   └── scripts/       # Seed and smoke-test scripts
└── dist/              # Production build output
    ├── client/        # Static frontend assets
    └── server/        # Server-side bundles
```

---

## Prerequisites

- Node.js 18+
- npm
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account

---

## Local Development Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd aurvelia-glow-forge-main

npm install
npm --prefix backend install
```

### 2. Configure environment variables

Create a `backend/.env` file:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/aurvelia?retryWrites=true&w=majority
JWT_SECRET=some_long_random_secret
PORT=4000
```

| Variable | Description | Required |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string | ✅ Yes |
| `JWT_SECRET` | Secret used to sign JWTs — keep private | ✅ Yes |
| `PORT` | Backend port (default: `4000`) | No |

### 3. Start the development servers

**Backend:**
```bash
npm --prefix backend run dev
```

**Frontend** (opens at `http://localhost:8080`):
```bash
npm run dev
```

### 4. Run smoke tests

```bash
node backend/scripts/smoke_tests.js

# Or run individual test scripts:
node backend/scripts/wishlist_test.js
```

---

## Production Build

### Frontend

```bash
npm run build
```

Outputs to:
- `dist/client/` — static assets for hosting
- `dist/server/` — server-side bundles

For a simple static deployment, serve `dist/client/`.

### Backend

```bash
# From repo root
cd backend
node server.js
```

---

## Deployment

### Frontend → Vercel

1. Create a Vercel project and connect your Git repository.
2. Configure build settings:
   - **Framework:** Other / Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/client`
3. No environment variables are required for a client-only build.
4. Deploy.

### Backend → Render

1. Create a new **Web Service** on Render and connect your Git repository.
2. Set the root directory to `backend/`.
3. Configure the service:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add the following environment variables in Render's dashboard:

   | Variable | Value |
   |---|---|
   | `MONGODB_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | Your JWT secret |
   | `PORT` | Leave unset — Render provides this automatically |

5. Deploy. Render will assign a public URL for the backend.

> **Note:** The current frontend uses relative `/api/...` paths, so it expects the backend to be on the same origin. If hosting frontend and backend separately, configure a reverse proxy or update `API_BASE` in the frontend to point to the Render URL.

### Database → MongoDB Atlas

1. Create a free-tier cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user and grant cluster access.
3. Under **Network Access**, whitelist your server IP(s) or allow all (`0.0.0.0/0`) for testing.
4. Copy the connection string and set it as `MONGODB_URI` in Render or `backend/.env`.

---

## Post-Deploy Checklist

- [ ] Frontend loads at Vercel URL
- [ ] Backend is live at Render URL
- [ ] `MONGODB_URI` and `JWT_SECRET` are set in Render environment
- [ ] Run smoke tests against deployed backend: `node backend/scripts/smoke_tests.js`
- [ ] Verify API routing (same-origin or reverse proxy configured correctly)

---

## Scripts Reference

| Command | Description |
|---|---|
| `npm run dev` | Start frontend dev server |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview production frontend build |
| `npm --prefix backend run dev` | Start backend with hot reload (Nodemon) |
| `npm --prefix backend start` | Start backend in production mode |

---

## Notes

- This project is prepared as a portfolio / MCA project.
- To add deployment config files (`vercel.json`, Render YAML), open an issue or reach out directly.
