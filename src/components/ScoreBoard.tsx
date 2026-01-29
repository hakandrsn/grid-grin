// src/components/ScoreBoard.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useGameStore } from "../store/useGameStore";
import { THEME } from "../utils/constants";

export const ScoreBoard = () => {
  const score = useGameStore((state) => state.score);
  const streak = useGameStore((state) => state.streak);

  return (
    <View style={styles.container}>
      <View style={styles.statBox}>
        <Text style={styles.label}>SCORE</Text>
        <Text style={styles.value}>{score}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statBox}>
        <Text style={[styles.label, { color: THEME.TEXT_SECONDARY }]}>
          STREAK
        </Text>
        <Text style={[styles.value, { color: THEME.TEXT_SECONDARY }]}>
          x{streak || 0}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.SURFACE,
    borderRadius: 16,
    padding: 8,
    paddingHorizontal: 24, // Slightly wider for better look
    gap: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  statBox: {
    alignItems: "center", // Center align text inside box for symmetry
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: THEME.TEXT_MUTED,
    opacity: 0.2,
  },
  label: {
    color: THEME.TEXT_MUTED,
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
    textAlign: "center",
  },
  value: {
    color: THEME.TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
  },
});
