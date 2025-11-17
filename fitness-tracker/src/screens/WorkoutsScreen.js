import React, { useState, useEffect } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { initDatabase } from "../database/database";

export default function WorkoutsScreen() {
  const [db, setDb] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const setupDb = async () => {
      const database = await initDatabase();
      setDb(database);
    };
    setupDb();
  }, []);

  const loadWorkouts = async () => {
    if (!db) return;
    try {
      const results = await db.getAllAsync("SELECT * FROM workouts;");
      setWorkouts(results);
    } catch (error) {
      console.log("Error loading workouts:", error);
    }
  };

  useEffect(() => {
    if (db) loadWorkouts();
  }, [db]);

  const addWorkout = async () => {
    if (!db) return;
    if (newWorkoutName.trim() === "") {
      Alert.alert("Грешка", "Моля въведете име на тренировката.");
      return;
    }

    try {
      await db.runAsync("INSERT INTO workouts (name, date) VALUES (?, ?);", [
        newWorkoutName,
        new Date().toISOString(),
      ]);
      setNewWorkoutName("");
      setModalVisible(false);
      await loadWorkouts();
    } catch (error) {
      console.log("Error adding workout:", error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("WorkoutDetails", {
                workoutId: item.id,
                workoutName: item.name,
              })
            }
          >
            <View style={styles.cardHeader}>
              <Ionicons name="barbell-outline" size={22} color="#0A84FF" />
              <Text style={styles.cardTitle}>{item.name}</Text>
            </View>
            <Text style={styles.cardSubtitle}>
              📅 {new Date(item.date).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>✨ Нова тренировка</Text>
            <TextInput
              placeholder="Име на тренировката"
              placeholderTextColor="#888"
              style={styles.input}
              value={newWorkoutName}
              onChangeText={setNewWorkoutName}
            />
            <TouchableOpacity style={styles.addButton} onPress={addWorkout}>
              <Text style={styles.addButtonText}>Добави</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Отказ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    padding: 16,
  },
  card: {
    backgroundColor: "#1C1C1E",
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#0A84FF",
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
  cardSubtitle: {
    color: "#888",
    fontSize: 14,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#0A84FF",
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0A84FF",
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  fabText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 12,
    padding: 12,
    color: "#FFF",
    marginBottom: 16,
    backgroundColor: "#2A2A2A",
  },
  addButton: {
    backgroundColor: "#0A84FF",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    marginTop: 10,
    alignItems: "center",
  },
  cancelText: {
    color: "#888",
    fontSize: 15,
  },
});
