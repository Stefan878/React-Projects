import { useState } from "react";
import "./App.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const addTodo = () => {
    if (inputValue.trim() === "") return;
    setTodos([...todos, inputValue]);
    setInputValue("");
  };

  const removeTodo = (index) => {
    const newTodos = todos.filter((_, i) => i !== index);
    setTodos(newTodos);
  };

  return (
    <div className="app">
      <div className="todo-container">
        <h1>📝 Todo App</h1>

        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            placeholder="Добави задача..."
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button onClick={addTodo}>Добави</button>
        </div>

        <ul className="todo-list">
          {todos.map((todo, index) => (
            <li key={index}>
              <span>{todo}</span>
              <button className="delete-btn" onClick={() => removeTodo(index)}>
                ❌
              </button>
            </li>
          ))}
        </ul>

        {todos.length === 0 && (
          <p className="empty-text">Няма добавени задачи.</p>
        )}
      </div>
    </div>
  );
}

export default App;
