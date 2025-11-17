import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Alert,
} from "react-native";
import { initDatabase } from "../database/database";

export default function ExerciseDetailsScreen({ route }) {
  const { exerciseId, exerciseName } = route.params;
  const [db, setDb] = useState(null);
  const [sets, setSets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [editingSet, setEditingSet] = useState(null);

  useEffect(() => {
    const setup = async () => {
      const database = await initDatabase();
      setDb(database);
    };
    setup();
  }, []);

  const loadSets = async () => {
    if (!db) return;
    const results = await db.getAllAsync(
      "SELECT * FROM sets WHERE exerciseId = ?;",
      [exerciseId]
    );
    setSets(results);
  };

  useEffect(() => {
    if (db) loadSets();
  }, [db]);

  const saveSet = async () => {
    if (!db || !weight || !reps) return;

    try {
      if (editingSet) {
        await db.runAsync(
          "UPDATE sets SET weight = ?, reps = ? WHERE id = ?;",
          [weight, reps, editingSet.id]
        );
      } else {
        await db.runAsync(
          "INSERT INTO sets (exerciseId, weight, reps) VALUES (?, ?, ?);",
          [exerciseId, weight, reps]
        );
      }
      setWeight("");
      setReps("");
      setEditingSet(null);
      setModalVisible(false);
      await loadSets();
    } catch (err) {
      Alert.alert("Грешка", "Неуспешно запазване на серия.");
    }
  };

  const deleteSet = async (id) => {
    if (!db) return;
    await db.runAsync("DELETE FROM sets WHERE id = ?;", [id]);
    await loadSets();
  };

  const totalVolume = sets.reduce(
    (sum, s) => sum + (s.weight || 0) * (s.reps || 0),
    0
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{exerciseName}</Text>

      <FlatList
        data={sets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>
              {item.weight} кг × {item.reps} повторения
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => {
                  setEditingSet(item);
                  setWeight(item.weight.toString());
                  setReps(item.reps.toString());
                  setModalVisible(true);
                }}
              >
                <Text style={styles.edit}>Редактирай</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteSet(item.id)}>
                <Text style={styles.delete}>Изтрий</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Text style={styles.volume}>
        Общ обем: <Text style={{ fontWeight: "700" }}>{totalVolume} кг</Text>
      </Text>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {editingSet ? "Редактирай серия" : "Нова серия"}
            </Text>

            <TextInput
              placeholder="Тежест (кг)"
              value={weight}
              keyboardType="numeric"
              onChangeText={setWeight}
              style={styles.input}
            />
            <TextInput
              placeholder="Повторения"
              value={reps}
              keyboardType="numeric"
              onChangeText={setReps}
              style={styles.input}
            />

            <Button title="Запази" onPress={saveSet} />
            <Button
              title="Отказ"
              color="gray"
              onPress={() => {
                setModalVisible(false);
                setEditingSet(null);
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  text: { fontSize: 16 },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  edit: { color: "#007AFF" },
  delete: { color: "red" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#007AFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  fabText: { color: "#fff", fontSize: 30, fontWeight: "bold" },
  volume: { fontSize: 16, marginTop: 10, textAlign: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
});
