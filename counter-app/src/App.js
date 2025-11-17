import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <div className="counter-container">
        <h1>🔢 Counter App</h1>
        <div className="counter">
          <button onClick={() => setCount(count - 1)} className="btn minus">-</button>
          
          <span className="count">{count}</span>
          <button onClick={() => setCount(count + 1)} className="btn plus">+</button>
        </div>
        <button className="btn reset" onClick={() => setCount(0)}>Reset</button>
      </div>
    </div>
  );
}

export default App;
