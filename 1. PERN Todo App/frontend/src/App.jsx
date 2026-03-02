import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
]

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  if (!response.ok) {
    let message = 'Request failed.'

    try {
      const body = await response.json()
      if (body?.message) {
        message = body.message
      }
    } catch {
      message = 'Unable to process request.'
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

function App() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [filter, setFilter] = useState('all')
  const [editingTodoId, setEditingTodoId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const data = await request('/todos')
        setTodos(Array.isArray(data) ? data : [])
      } catch (error) {
        setErrorMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTodos()
  }, [])

  const filteredTodos = useMemo(() => {
    if (filter === 'active') {
      return todos.filter((todo) => !todo.completed)
    }

    if (filter === 'completed') {
      return todos.filter((todo) => todo.completed)
    }

    return todos
  }, [todos, filter])

  const completedCount = useMemo(
    () => todos.filter((todo) => todo.completed).length,
    [todos],
  )

  const activeCount = todos.length - completedCount

  const handleAddTodo = async (event) => {
    event.preventDefault()

    const title = newTodo.trim()
    if (!title || saving) {
      return
    }

    setSaving(true)
    setErrorMessage('')

    try {
      const createdTodo = await request('/todos', {
        method: 'POST',
        body: JSON.stringify({ title }),
      })
      setTodos((prev) => [createdTodo, ...prev])
      setNewTodo('')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleTodo = async (id) => {
    if (saving) {
      return
    }

    const currentTodo = todos.find((todo) => todo.id === id)
    if (!currentTodo) {
      return
    }

    setSaving(true)
    setErrorMessage('')

    try {
      const updatedTodo = await request(`/todos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed: !currentTodo.completed }),
      })

      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updatedTodo : todo)),
      )
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteTodo = async (id) => {
    if (saving) {
      return
    }

    setSaving(true)
    setErrorMessage('')

    try {
      await request(`/todos/${id}`, { method: 'DELETE' })
      setTodos((prev) => prev.filter((todo) => todo.id !== id))

      if (editingTodoId === id) {
        setEditingTodoId(null)
        setEditingText('')
      }
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (todo) => {
    setEditingTodoId(todo.id)
    setEditingText(todo.title)
  }

  const saveEdit = async (id) => {
    const updatedTitle = editingText.trim()
    if (!updatedTitle || saving) {
      return
    }

    setSaving(true)
    setErrorMessage('')

    try {
      const updatedTodo = await request(`/todos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: updatedTitle }),
      })

      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updatedTodo : todo)),
      )
      setEditingTodoId(null)
      setEditingText('')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  const cancelEditing = () => {
    setEditingTodoId(null)
    setEditingText('')
  }

  const clearCompleted = async () => {
    if (saving || !completedCount) {
      return
    }

    setSaving(true)
    setErrorMessage('')

    try {
      await request('/todos/completed', { method: 'DELETE' })
      setTodos((prev) => prev.filter((todo) => !todo.completed))
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleAll = async () => {
    if (!todos.length || saving) {
      return
    }

    const shouldCompleteAll = todos.some((todo) => !todo.completed)

    setSaving(true)
    setErrorMessage('')

    try {
      const updatedTodos = await request('/todos/toggle-all', {
        method: 'PATCH',
        body: JSON.stringify({ completed: shouldCompleteAll }),
      })
      setTodos(Array.isArray(updatedTodos) ? updatedTodos : [])
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="todo-card">
        <header className="todo-header">
          <div>
            <h1>PERN Todo App</h1>
            <p>Node + Express + PostgreSQL connected</p>
          </div>
          <button
            type="button"
            className="ghost-btn"
            onClick={toggleAll}
            disabled={saving || !todos.length}
          >
            Toggle All
          </button>
        </header>

        <form className="todo-form" onSubmit={handleAddTodo}>
          <input
            type="text"
            value={newTodo}
            onChange={(event) => setNewTodo(event.target.value)}
            placeholder="Add a new task..."
            aria-label="Add a new task"
            maxLength={120}
            disabled={saving}
          />
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Add'}
          </button>
        </form>

        {errorMessage ? <p className="status-text error">{errorMessage}</p> : null}
        {loading ? <p className="status-text">Loading todos...</p> : null}

        <div className="filter-row" role="tablist" aria-label="Todo filters">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={filter === item.value ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <ul className="todo-list">
          {!loading && filteredTodos.length ? (
            filteredTodos.map((todo) => {
              const isEditing = editingTodoId === todo.id

              return (
                <li key={todo.id} className="todo-item">
                  <label className="todo-check">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      disabled={saving}
                      onChange={() => toggleTodo(todo.id)}
                    />
                    <span />
                  </label>

                  <div className="todo-content">
                    {isEditing ? (
                      <input
                        value={editingText}
                        onChange={(event) => setEditingText(event.target.value)}
                        className="edit-input"
                        autoFocus
                        maxLength={120}
                        disabled={saving}
                      />
                    ) : (
                      <p className={todo.completed ? 'todo-text done' : 'todo-text'}>
                        {todo.title}
                      </p>
                    )}
                  </div>

                  <div className="todo-actions">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          className="icon-btn save"
                          onClick={() => saveEdit(todo.id)}
                          disabled={saving}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={cancelEditing}
                          disabled={saving}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => startEditing(todo)}
                          disabled={saving}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="icon-btn danger"
                          onClick={() => deleteTodo(todo.id)}
                          disabled={saving}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </li>
              )
            })
          ) : !loading ? (
            <li className="empty-state">No tasks here. Add your first todo.</li>
          ) : null}
        </ul>

        <footer className="todo-footer">
          <p>
            <strong>{activeCount}</strong> active • <strong>{completedCount}</strong>{' '}
            completed
          </p>
          <button
            type="button"
            className="ghost-btn"
            onClick={clearCompleted}
            disabled={!completedCount}
          >
            Clear Completed
          </button>
        </footer>
      </section>
    </main>
  )
}

export default App
