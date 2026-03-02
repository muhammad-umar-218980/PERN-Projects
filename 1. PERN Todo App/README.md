# PERN Todo App

Full-stack Todo app using:

- PostgreSQL (local)
- Express + Node.js backend
- React (Vite) frontend

## Project Structure

- `backend` → Node/Express API + PostgreSQL
- `frontend` → React UI
- root `package.json` → runs both apps together

## 1) Prerequisites

- Node.js 18+ (recommended 20+)
- PostgreSQL installed locally
- PgAdmin (optional, for viewing data)

## 2) Database Setup

1. Create a database named `perntodo` in PostgreSQL.
2. Update `backend/.env` with your local credentials:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=perntodo
FRONTEND_URL=http://localhost:5173
```

> The backend auto-creates the `todos` table on startup.

## 3) Install Dependencies

From the app root:

```bash
cd "d:\PERN-Projects\1. PERN Todo App"
npm install
npm install --prefix backend
npm install --prefix frontend
```

## 4) Run Frontend + Backend Together

From the app root:

```bash
npm run dev
```

Services:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## 5) View Data in PgAdmin

1. Open PgAdmin and connect to your local PostgreSQL server.
2. Expand:
   - `Servers`
   - your server
   - `Databases`
   - `perntodo`
   - `Schemas` → `public` → `Tables`
3. Right-click `todos` → `View/Edit Data` → `All Rows`.

You can also run this SQL in Query Tool:

```sql
SELECT *
FROM todos
ORDER BY created_at DESC;
```

## 6) Useful Commands

- Run only backend: `npm run backend`
- Run only frontend: `npm run frontend`
- Backend direct: `npm run dev --prefix backend`
- Frontend direct: `npm run dev --prefix frontend`

## Troubleshooting

- If frontend shows API errors, make sure backend is running on port `5000`.
- If backend fails PostgreSQL auth, recheck `DB_USER` and `DB_PASSWORD` in `backend/.env`.
- If table is missing, restart backend once after fixing DB credentials.
