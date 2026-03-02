import { Router } from 'express'
import pool from '../db.js'

const router = Router()

const mapTodo = (row) => ({
  id: row.id,
  title: row.title,
  completed: row.completed,
  createdAt: row.created_at,
})

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, title, completed, created_at FROM todos ORDER BY created_at DESC',
    )
    res.json(rows.map(mapTodo))
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const title = req.body?.title?.trim()
    if (!title) {
      return res.status(400).json({ message: 'Title is required.' })
    }

    const { rows } = await pool.query(
      'INSERT INTO todos (title) VALUES ($1) RETURNING id, title, completed, created_at',
      [title],
    )
    return res.status(201).json(mapTodo(rows[0]))
  } catch (error) {
    return next(error)
  }
})

router.patch('/toggle-all', async (req, res, next) => {
  try {
    const shouldCompleteAll = Boolean(req.body?.completed)

    await pool.query('UPDATE todos SET completed = $1', [shouldCompleteAll])

    const { rows } = await pool.query(
      'SELECT id, title, completed, created_at FROM todos ORDER BY created_at DESC',
    )
    res.json(rows.map(mapTodo))
  } catch (error) {
    next(error)
  }
})

router.delete('/completed', async (_req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM todos WHERE completed = TRUE')
    res.json({ deletedCount: result.rowCount })
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const todoId = Number(req.params.id)
    if (!Number.isInteger(todoId)) {
      return res.status(400).json({ message: 'Invalid todo id.' })
    }

    const nextTitle =
      typeof req.body?.title === 'string' ? req.body.title.trim() : undefined
    const nextCompleted =
      typeof req.body?.completed === 'boolean' ? req.body.completed : undefined

    if (nextTitle === undefined && nextCompleted === undefined) {
      return res
        .status(400)
        .json({ message: 'Provide title and/or completed to update.' })
    }

    if (nextTitle !== undefined && !nextTitle) {
      return res.status(400).json({ message: 'Title cannot be empty.' })
    }

    const { rows } = await pool.query(
      `
      UPDATE todos
      SET
        title = COALESCE($1, title),
        completed = COALESCE($2, completed)
      WHERE id = $3
      RETURNING id, title, completed, created_at
      `,
      [nextTitle ?? null, nextCompleted ?? null, todoId],
    )

    if (!rows[0]) {
      return res.status(404).json({ message: 'Todo not found.' })
    }

    return res.json(mapTodo(rows[0]))
  } catch (error) {
    return next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const todoId = Number(req.params.id)
    if (!Number.isInteger(todoId)) {
      return res.status(400).json({ message: 'Invalid todo id.' })
    }

    const result = await pool.query('DELETE FROM todos WHERE id = $1', [todoId])
    if (!result.rowCount) {
      return res.status(404).json({ message: 'Todo not found.' })
    }

    return res.status(204).send()
  } catch (error) {
    return next(error)
  }
})

export default router
