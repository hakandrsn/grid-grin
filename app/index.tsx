import { useGameStore } from "@/src/store/useGameStore";
import { THEME } from "@/src/utils/constants";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MainMenu() {
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const { loadGame, hasSavedGame, resetGame, score, leaderboard } =
    useGameStore();

  useEffect(() => {
    loadGame(); // Check for saved game on mount
  }, []);

  const handleNewGame = () => {
    resetGame();
    router.replace("/game");
  };

  const handleContinue = () => {
    router.replace("/game");
  };

  const [best, second, third] = leaderboard;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: top + 40, paddingBottom: bottom + 40 },
      ]}
    >
      <Animated.Text
        entering={FadeInDown.delay(200).springify()}
        style={styles.title}
      >
        GRID GRIN
      </Animated.Text>

      {/* Leaderboard Section */}
      <Animated.View
        entering={FadeInDown.delay(300)}
        style={styles.lbContainer}
      >
        <Text style={styles.bestLabel}>EN İYİ SKORLAR</Text>
        <Text style={styles.bestScore}>{best}</Text>

        {second > 0 && <Text style={styles.secondScore}>{second}</Text>}

        {third > 0 && <Text style={styles.thirdScore}>{third}</Text>}
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(500).springify()}
        style={styles.menuContainer}
      >
        {hasSavedGame && (
          <TouchableOpacity
            style={[styles.button, styles.continueButton]}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>DEVAM ET</Text>
            <Text style={styles.scoreText}>{score} Puan</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.newGameButton]}
          onPress={handleNewGame}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, styles.newGameText]}>BAŞLA</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.Text entering={FadeInDown.delay(700)} style={styles.version}>
        v1.0.0
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.BACKGROUND,
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 64,
    fontWeight: "900",
    color: THEME.TEXT_PRIMARY,
    letterSpacing: 4,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  lbContainer: {
    alignItems: "center",
    marginBottom: 20,
    gap: 0, // Dikey boşlukları manuel kontrol edeceğiz veya gap verebiliriz
    minHeight: 120, // Sabit bir alan kaplasın ki UI zıplamasın
    justifyContent: "center",
  },
  bestLabel: {
    color: THEME.TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 8,
  },
  bestScore: {
    color: THEME.TEXT_PRIMARY,
    fontSize: 56, // Biraz daha büyüttüm
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: 64,
  },
  secondScore: {
    color: THEME.TEXT_PRIMARY, // Biraz daha soluk olabilir ama primary kalsın
    fontSize: 32,
    fontWeight: "800",
    opacity: 0.8,
    marginTop: 4,
  },
  thirdScore: {
    color: THEME.TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: "700",
    opacity: 0.6,
    marginTop: 2,
  },
  menuContainer: {
    width: "100%",
    paddingHorizontal: 40,
    gap: 20,
    alignItems: "center",
  },
  button: {
    width: "100%",
    paddingVertical: 24,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 0, // No shadow
    shadowOpacity: 0, // No shadow
  },
  continueButton: {
    backgroundColor: THEME.SURFACE_LIGHT,
    borderWidth: 1,
    borderColor: THEME.TEXT_SECONDARY,
  },
  newGameButton: {
    backgroundColor: THEME.BUTTON_PRIMARY,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "900",
    color: THEME.BUTTON_TEXT,
    letterSpacing: 1,
  },
  newGameText: {
    color: THEME.BUTTON_TEXT,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.TEXT_SECONDARY,
    marginTop: 4,
  },
  version: {
    color: THEME.TEXT_MUTED,
    fontSize: 12,
  },
});
