import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { initDatabase } from "../database/database";

export default function WorkoutDetailsScreen({ route }) {
  const { workoutId, workoutName } = route.params;
  const [db, setDb] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");

  useEffect(() => {
    const setupDb = async () => {
      const database = await initDatabase();
      setDb(database);
    };
    setupDb();
  }, []);

  useEffect(() => {
    if (db) loadData();
  }, [db]);

  const loadData = async () => {
    if (!db) return;
    try {
      const exerciseList = await db.getAllAsync(
        "SELECT * FROM exercises WHERE workoutId = ?;",
        [workoutId]
      );

      for (let e of exerciseList) {
        e.sets = await db.getAllAsync("SELECT * FROM sets WHERE exerciseId = ?;", [e.id]);
      }

      setExercises(exerciseList);
    } catch (error) {
      console.log("Error loading workout details:", error);
    }
  };

  const addExercise = async () => {
    if (!db) return;
    if (newExerciseName.trim() === "") return;

    await db.runAsync("INSERT INTO exercises (workoutId, exerciseName) VALUES (?, ?);", [
      workoutId,
      newExerciseName.trim(),
    ]);

    setNewExerciseName("");
    setExerciseModalVisible(false);
    await loadData();
  };

  const addSet = async (exerciseId) => {
    await db.runAsync(
      "INSERT INTO sets (exerciseId, weight, reps, completed) VALUES (?, ?, ?, ?);",
      [exerciseId, 0, 0, 0]
    );
    await loadData();
  };

  const updateSet = async (id, field, value) => {
    await db.runAsync(`UPDATE sets SET ${field} = ? WHERE id = ?;`, [value, id]);
  };

  const toggleSetComplete = async (setId, currentStatus) => {
    const newStatus = currentStatus ? 0 : 1;
    await db.runAsync("UPDATE sets SET completed = ? WHERE id = ?;", [newStatus, setId]);
    await loadData();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{workoutName}</Text>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{item.exerciseName}</Text>
              <TouchableOpacity onPress={() => addSet(item.id)}>
                <Ionicons name="add-circle" size={28} color="#0a84ff" />
              </TouchableOpacity>
            </View>

            {item.sets.map((s, index) => (
              <View
                key={s.id}
                style={[styles.setRow, s.completed ? styles.setCompleted : null]}
              >
                <Text style={styles.setNumber}>{index + 1}.</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  defaultValue={s.weight.toString()}
                  onChangeText={(val) => updateSet(s.id, "weight", parseFloat(val) || 0)}
                  editable={!s.completed}
                />
                <Text style={styles.unit}>кг</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  defaultValue={s.reps.toString()}
                  onChangeText={(val) => updateSet(s.id, "reps", parseInt(val) || 0)}
                  editable={!s.completed}
                />
                <Text style={styles.unit}>повт.</Text>

                <TouchableOpacity
                  onPress={() => toggleSetComplete(s.id, s.completed)}
                  style={styles.doneBtn}
                >
                  <Ionicons
                    name={s.completed ? "checkmark-circle" : "ellipse-outline"}
                    size={26}
                    color={s.completed ? "#00ff7f" : "#666"}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* ➕ Добавяне на упражнение */}
      <TouchableOpacity
        style={styles.addExerciseButton}
        onPress={() => setExerciseModalVisible(true)}
      >
        <Text style={styles.addExerciseText}>+ Добави упражнение</Text>
      </TouchableOpacity>

      {/* 🧾 Модален прозорец за име на упражнение */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={exerciseModalVisible}
        onRequestClose={() => setExerciseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Ново упражнение</Text>

            <TextInput
              placeholder="Име на упражнението"
              placeholderTextColor="#888"
              style={styles.modalInput}
              value={newExerciseName}
              onChangeText={setNewExerciseName}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#0a84ff" }]}
                onPress={addExercise}
              >
                <Text style={styles.modalButtonText}>Добави</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#444" }]}
                onPress={() => setExerciseModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Отказ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
  },
  exerciseCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  setCompleted: {
    opacity: 0.5,
  },
  setNumber: {
    color: "#aaa",
    width: 25,
    fontSize: 16,
  },
  input: {
    backgroundColor: "#2a2a2a",
    color: "#fff",
    padding: 6,
    borderRadius: 8,
    width: 60,
    marginHorizontal: 5,
    textAlign: "center",
  },
  unit: {
    color: "#888",
    marginRight: 10,
  },
  doneBtn: {
    marginLeft: "auto",
  },
  addExerciseButton: {
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#2f2f2f",
  },
  addExerciseText: {
    color: "#0a84ff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#1c1c1e",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2f2f2f",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: "#2c2c2e",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
