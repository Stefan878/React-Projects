import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🏋️</Text>
      <Text style={styles.title}>Добре дошъл обратно!</Text>
      <Text style={styles.subtitle}>
        Проследявай тренировките си, постиженията и целите си.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    color: "#FFF",
    fontWeight: "700",
  },
  subtitle: {
    color: "#A1A1A1",
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
});
