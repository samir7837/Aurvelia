Aurvelia — MERN Portfolio Store

Project overview
---------------
Aurvelia is an e-commerce portfolio application (frontend + Express/Mongoose backend) demonstrating product browsing, cart, wishlist, orders, reviews, newsletter and an admin dashboard. The frontend is a Vite + React (TanStack Router/React Query) app. The backend is Node.js + Express with Mongoose (MongoDB Atlas) and JWT authentication.

Tech stack
----------
- Frontend: React 19, TypeScript, Vite, TanStack Router, TanStack React Query
- UI: Tailwind / Radix primitives, lucide-react icons
- Backend: Node.js, Express, Mongoose, JWT (jsonwebtoken), bcryptjs
- Database: MongoDB Atlas (recommended for production)
- Dev tools: Nodemon (backend), Vite (frontend)

Features
--------
- Product catalog (list / detail)
- Auth: register / login / auth/me (JWT stored in localStorage)
- Cart: add / list / update
- Wishlist: add / list / delete
- Orders: create and list (subtotal and order_number computed server-side)
- Reviews: list and create
- Newsletter and contact endpoints
- Admin endpoints: stats, orders, reviews, messages, subscribers

Repository layout
-----------------
- `/src` — frontend source
- `/backend` — backend Express app
- `/dist` — frontend production build (client + server bundles)
- `/backend/scripts` — seed and smoke-test scripts

Installation
------------
Prerequisites: Node 18+ and npm, an account on MongoDB Atlas.

1. Clone repository

```bash
git clone <repo-url>
cd aurvelia-glow-forge-main
```

2. Install dependencies

```bash
npm install
npm --prefix backend install
```

Environment variables
---------------------
Required for backend production and local development (set these on Render/Vercel or in `.env` for local):

- `MONGODB_URI` — MongoDB Atlas connection string (include username/password). Example:
  mongodb+srv://<user>:<password>@cluster0.mongodb.net/aurvelia?retryWrites=true&w=majority
- `JWT_SECRET` — Secret used to sign JWTs (keep private)
- `PORT` — (optional) port for backend (default 4000)

Local development setup
-----------------------
1. Create `backend/.env` containing at least:

```
MONGODB_URI=your_mongo_connection_string
JWT_SECRET=some_long_random_secret
PORT=4000
```

2. Start backend (development):

```bash
npm --prefix backend run dev
```

3. Start frontend (development):

```bash
npm run dev
# opens at http://localhost:8080
```

4. Run the smoke tests to validate API flows:

```bash
node backend/scripts/smoke_tests.js
# or individually: node backend/scripts/wishlist_test.js
```

Production build steps (local validation)
----------------------------------------
1. Frontend production build (Vite):

```bash
npm run build
```

- Output directories: `dist/client` (static client assets) and `dist/server` (server-side bundles).
- The repository already builds both client and server bundles. For simple static hosting, use `dist/client`.

2. Backend validation:

- The backend is a plain Node.js app. From the `backend` folder, ensure `backend/.env` is set and run:

```bash
# from repo root
Set-Location -LiteralPath "./backend"
node server.js
```

- Alternatively use `npm --prefix backend run dev` for development with hot reload.

Build / start commands summary
-----------------------------
- Frontend build: `npm run build` (root)
- Frontend preview (optional): `npm run preview` (root)
- Frontend dev: `npm run dev` (root)
- Backend dev: `npm --prefix backend run dev`
- Backend start (production): `npm --prefix backend start` (runs `node server.js`)

Deployment instructions
-----------------------
Frontend (Vercel)
-----------------
1. Create a Vercel project and connect your Git repo.
2. In Project Settings -> General, set the Root (if deploying from monorepo) to the repository root.
3. Set the following build settings:
   - Framework: Other / Vite
   - Build Command: `npm run build`
   - Output Directory: `dist/client`
4. Environment variables: none required for client-only build.
5. Deploy — Vercel will run the build and serve static assets from `dist/client`.

Backend (Render)
-----------------
1. Create a new Web Service on Render (or other Node host).
2. Connect your Git repo and set the Deploy Branch.
3. Set the root directory for the service to the `backend` folder (or use the `Backend` root in Render's settings).
4. Build Command: (none required) — Render will `npm install` automatically. If you want explicit, set: `npm install`.
5. Start Command: `npm start` (this runs `node server.js` as defined in `backend/package.json`).
6. Environment variables (must be configured in Render):
   - `MONGODB_URI` — MongoDB Atlas connection string
   - `JWT_SECRET` — JWT secret
   - `PORT` — leave unset; Render will provide a port automatically (the app reads `process.env.PORT`)
7. Deploy. After deploy, Render will assign a URL for the backend.

Database (MongoDB Atlas)
------------------------
1. Create a free tier cluster on MongoDB Atlas.
2. Create a database user with a strong password and give access to the cluster.
3. Whitelist your server IP(s) or allow access from anywhere for testing (0.0.0.0/0).
4. Get the connection string and set it as `MONGODB_URI` in Render (or in `backend/.env` for local development).

Verification checklist (post-deploy)
------------------------------------
- Visit frontend (Vercel URL) — pages load
- Ensure backend URL (Render) is configured as `API_BASE` in frontend if you switch from relative `/api/...` to absolute URLs (current frontend expects same-origin `/api`—use a reverse proxy or set environment to point to backend)
- Run `node backend/scripts/smoke_tests.js` (on a machine that can reach the deployed backend) with `PORT` or BASE URL adjusted

Notes
-----
- The frontend build produces both client and server bundles; for a simple static deployment we use `dist/client`.
- The backend requires `MONGODB_URI` and `JWT_SECRET` to be set in the environment for production.

Contact / Maintainer
--------------------
This repo is prepared as a portfolio / MCA project. If you want me to produce exact Render / Vercel configuration files (e.g., `vercel.json` or Render YAML), tell me and I'll add them — but per your instruction I won't add new files unless you ask.
