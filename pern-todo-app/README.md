# PERN Todo App

A full-stack todo application built with the PERN stack (PostgreSQL, Express, React, Node.js).

## Features

- Create, read, update, and delete todos
- RESTful API with Express
- PostgreSQL database
- React frontend with Bootstrap styling

## Project Structure

```
pern-todo-app/
├── server/          # Express + Node.js backend
│   ├── index.js     # Server entry point & routes
│   ├── db.js        # PostgreSQL connection pool
│   ├── database.sql # SQL schema
│   └── .env.example # Environment variables template
└── client/          # React frontend (Vite)
    ├── src/
    │   ├── components/
    │   │   ├── InputTodo.jsx
    │   │   ├── ListTodos.jsx
    │   │   └── EditTodo.jsx
    │   └── App.jsx
    └── index.html
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/)

## Getting Started

### 1. Database Setup

Connect to PostgreSQL and run the SQL schema:

```bash
psql -U postgres -f server/database.sql
```

### 2. Server Setup

```bash
cd server
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm install
npm start
```

The server runs on `http://localhost:5000`.

### 3. Client Setup

```bash
cd client
npm install
npm run dev
```

The client runs on `http://localhost:5173`.

## API Endpoints

| Method | Route         | Description         |
|--------|---------------|---------------------|
| GET    | /todos        | Get all todos       |
| GET    | /todos/:id    | Get a single todo   |
| POST   | /todos        | Create a new todo   |
| PUT    | /todos/:id    | Update a todo       |
| DELETE | /todos/:id    | Delete a todo       |
