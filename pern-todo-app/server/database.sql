CREATE DATABASE pern_todo;

\c pern_todo;

CREATE TABLE todos (
  todo_id SERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL
);
