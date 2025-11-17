import React, { useEffect } from "react";
import { View, Text, StyleSheet, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { initDatabase } from "./src/database/database";

// Импортирай екрани
import WorkoutsScreen from "./src/screens/WorkoutsScreen";
import WorkoutDetails from "./src/screens/WorkoutDetailScreen";

function HomeScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>🏋️ Добре дошъл!</Text>
      <Text style={styles.text}>Проследявай тренировките си и напредъка си.</Text>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>👤 Профил</Text>
      <Text style={styles.text}>Тук ще можеш да виждаш статистики и настройки.</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function WorkoutsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#0A0A0A" },
        headerTintColor: "#fff",
      }}
    >
      <Stack.Screen
        name="WorkoutsList"
        component={WorkoutsScreen}
        options={{ title: "Тренировки" }}
      />
      <Stack.Screen
        name="WorkoutDetails"
        component={WorkoutDetails}
        options={({ route }) => ({
          title: route.params?.workoutName || "Детайли за тренировка",
        })}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    initDatabase(); // инициализация на базата
  }, []);

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#1C1C1E",
            borderTopWidth: 0,
            height: 60,
          },
          tabBarActiveTintColor: "#0A84FF",
          tabBarInactiveTintColor: "#a1a1a1",
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === "Начало") iconName = "home";
            else if (route.name === "Тренировки") iconName = "barbell";
            else if (route.name === "Профил") iconName = "person";
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Начало" component={HomeScreen} />
        <Tab.Screen name="Тренировки" component={WorkoutsStack} />
        <Tab.Screen name="Профил" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "700",
    marginBottom: 10,
  },
  text: {
    color: "#a1a1a1",
    fontSize: 16,
    textAlign: "center",
  },
});
