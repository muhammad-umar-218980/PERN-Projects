import { useState } from "react";
import InputTodo from "./components/InputTodo";
import ListTodos from "./components/ListTodos";

function App() {
  const [refresh, setRefresh] = useState(false);

  const handleTodoAdded = () => {
    setRefresh((prev) => !prev);
  };

  return (
    <div className="container">
      <InputTodo onTodoAdded={handleTodoAdded} />
      <ListTodos refresh={refresh} />
    </div>
  );
}

export default App;
