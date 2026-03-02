import { useState, useEffect } from "react";
import EditTodo from "./EditTodo";

function ListTodos({ refresh }) {
  const [todos, setTodos] = useState([]);

  const getTodos = async () => {
    try {
      const response = await fetch("http://localhost:5000/todos");
      const jsonData = await response.json();
      setTodos(jsonData);
    } catch (err) {
      console.error(err.message);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await fetch(`http://localhost:5000/todos/${id}`, {
        method: "DELETE",
      });
      setTodos(todos.filter((todo) => todo.todo_id !== id));
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    getTodos();
  }, [refresh]);

  return (
    <table className="table mt-5 text-center">
      <thead>
        <tr>
          <th>#</th>
          <th>Description</th>
          <th>Edit</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        {todos.map((todo, index) => (
          <tr key={todo.todo_id}>
            <td>{index + 1}</td>
            <td>{todo.description}</td>
            <td>
              <EditTodo todo={todo} onTodoUpdated={getTodos} />
            </td>
            <td>
              <button
                className="btn btn-danger"
                onClick={() => deleteTodo(todo.todo_id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ListTodos;
