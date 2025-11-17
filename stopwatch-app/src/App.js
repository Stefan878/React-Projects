import { useState, useRef } from "react";
import "./App.css";

function App() {
  const [time, setTime] = useState(0); // 🕒 текущо време в милисекунди
  const [isRunning, setIsRunning] = useState(false); // 🟢 Показва дали хронометърът работи 
  const intervalRef = useRef(null); // 🔁 ще пазим ID-то на setInterval()

  // ▶️ Стартиране
  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 10); // добавяме по 10ms
      }, 10);
    }
  };

  // ⏸️ Спиране
  const stopTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
  };

  // 🔄 Нулиране
  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTime(0);
  };

  // 🧮 Форматиране на времето (мм:сс:мс)
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}:${String(milliseconds).padStart(2, "0")}`;
  };

  return (
    <div className="app">
      <div className="stopwatch-container">
        <h1>⏱️ Stopwatch</h1>
        <div className="display">{formatTime(time)}</div>

        <div className="buttons">
          {!isRunning ? (
            <button className="start" onClick={startTimer}>
              ▶️ Start
            </button>
          ) : (
            <button className="stop" onClick={stopTimer}>
              ⏸️ Stop
            </button>
          )}
          <button className="reset" onClick={resetTimer}>
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
