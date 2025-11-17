// src/database/database.js
import * as SQLite from "expo-sqlite";

let db = null;

// 🟩 Инициализация на базата данни + миграция
export const initDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("fitness.db");

    // 1️⃣ Създаваме таблиците (ако не съществуват)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        date TEXT
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workoutId INTEGER,
        exerciseName TEXT,
        FOREIGN KEY(workoutId) REFERENCES workouts(id)
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exerciseId INTEGER,
        weight REAL,
        reps INTEGER,
        completed INTEGER DEFAULT 0,
        FOREIGN KEY(exerciseId) REFERENCES exercises(id)
      );
    `);

    // 2️⃣ Проверка и добавяне на колоната "completed", ако липсва
    try {
      // ще хвърли грешка, ако колоната вече съществува
      await db.execAsync(`ALTER TABLE sets ADD COLUMN completed INTEGER DEFAULT 0;`);
      console.log("✅ Колоната 'completed' беше добавена (миграция).");
    } catch (error) {
      // това е нормално, ако колоната вече съществува
      console.log("ℹ️ Миграцията е вече извършена или колоната съществува.");
    }
  }

  return db;
};

// 🟦 ВЗИМАНЕ НА ВСИЧКИ ТРЕНИРОВКИ
export const getAllWorkouts = async () => {
  const database = await initDatabase();
  const result = await database.getAllAsync("SELECT * FROM workouts ORDER BY id DESC;");
  return result;
};

// 🟦 ДОБАВЯНЕ НА ТРЕНИРОВКА
export const addWorkout = async (name) => {
  const database = await initDatabase();
  await database.runAsync("INSERT INTO workouts (name, date) VALUES (?, datetime('now'));", [name]);
};

// 🟦 ВЗИМАНЕ НА УПРАЖНЕНИЯ ЗА КОНКРЕТНА ТРЕНИРОВКА
export const getExercisesForWorkout = async (workoutId) => {
  const database = await initDatabase();
  const result = await database.getAllAsync(
    "SELECT * FROM exercises WHERE workoutId = ? ORDER BY id ASC;",
    [workoutId]
  );
  return result;
};

// 🟦 ДОБАВЯНЕ НА УПРАЖНЕНИЕ
export const addExerciseToWorkout = async (workoutId, exerciseName) => {
  const database = await initDatabase();
  await database.runAsync(
    "INSERT INTO exercises (workoutId, exerciseName) VALUES (?, ?);",
    [workoutId, exerciseName]
  );
};

// 🟦 ВЗИМАНЕ НА СЕТОВЕ ЗА КОНКРЕТНО УПРАЖНЕНИЕ
export const getSetsForExercise = async (exerciseId) => {
  const database = await initDatabase();
  const result = await database.getAllAsync(
    "SELECT * FROM sets WHERE exerciseId = ? ORDER BY id ASC;",
    [exerciseId]
  );
  return result;
};

// 🟦 ДОБАВЯНЕ НА СЕТ
export const addSetToExercise = async (exerciseId, weight = 0, reps = 0) => {
  const database = await initDatabase();
  await database.runAsync(
    "INSERT INTO sets (exerciseId, weight, reps, completed) VALUES (?, ?, ?, 0);",
    [exerciseId, weight, reps]
  );
};

// 🟦 ОБНОВЯВАНЕ НА СТОЙНОСТ НА ПОЛЕ В СЕТ
export const updateSetField = async (setId, field, value) => {
  const database = await initDatabase();
  // безопасност — позволяваме само weight или reps
  if (!["weight", "reps"].includes(field)) return;
  await database.runAsync(`UPDATE sets SET ${field} = ? WHERE id = ?;`, [value, setId]);
};

// 🟦 ПРЕВКЛЮЧВАНЕ НА COMPLETE СЪСТОЯНИЕ
export const toggleSetComplete = async (setId, currentCompleted) => {
  const database = await initDatabase();
  const newValue = currentCompleted ? 0 : 1;
  await database.runAsync("UPDATE sets SET completed = ? WHERE id = ?;", [newValue, setId]);
};
