const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const pool = require("./db");

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Routes

// Get all todos
app.get("/todos", async (req, res) => {
  try {
    const allTodos = await pool.query("SELECT * FROM todos ORDER BY todo_id");
    res.json(allTodos.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get a todo
app.get("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await pool.query(
      "SELECT * FROM todos WHERE todo_id = $1",
      [id]
    );
    if (todo.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json(todo.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a todo
app.post("/todos", async (req, res) => {
  try {
    const { description } = req.body;
    if (!description || description.trim() === "") {
      return res.status(400).json({ error: "Description is required" });
    }
    const newTodo = await pool.query(
      "INSERT INTO todos (description) VALUES ($1) RETURNING *",
      [description]
    );
    res.status(201).json(newTodo.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Update a todo
app.put("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    if (!description || description.trim() === "") {
      return res.status(400).json({ error: "Description is required" });
    }
    const updatedTodo = await pool.query(
      "UPDATE todos SET description = $1 WHERE todo_id = $2 RETURNING *",
      [description, id]
    );
    if (updatedTodo.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json(updatedTodo.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a todo
app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTodo = await pool.query(
      "DELETE FROM todos WHERE todo_id = $1 RETURNING *",
      [id]
    );
    if (deletedTodo.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json({ message: "Todo deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
