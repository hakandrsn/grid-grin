import { useGameStore } from "@/src/store/useGameStore";
import { THEME } from "@/src/utils/constants";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
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
    (async () => {
      await requestTrackingPermissionsAsync();
    })();
  }, []);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

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
        { paddingTop: top + 20, paddingBottom: bottom + 20 },
      ]}
    >
      {/* Top Section: Logo + Title */}
      <View style={styles.topSection}>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
          />
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(200).springify()}
          style={styles.title}
        >
          GRID GRIN
        </Animated.Text>
        <Animated.View
          entering={FadeInDown.delay(300)}
          style={styles.lbContainer}
        >
          <Text style={styles.bestLabel}>EN İYİ SKORLAR</Text>
          <Text style={styles.bestScore}>{best}</Text>
          {second > 0 && <Text style={styles.secondScore}>{second}</Text>}
          {third > 0 && <Text style={styles.thirdScore}>{third}</Text>}
        </Animated.View>
      </View>

      {/* Bottom Section: Buttons + Version */}
      <View style={styles.bottomSection}>
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
      </View>
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
  topSection: {
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 140,
    height: 140,
  },
  title: {
    fontSize: 48,
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
    gap: 4,
  },
  bestLabel: {
    color: THEME.TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 4,
  },
  bestScore: {
    color: THEME.TEXT_PRIMARY,
    fontSize: 56,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  secondScore: {
    color: THEME.TEXT_PRIMARY,
    fontSize: 32,
    fontWeight: "800",
    opacity: 0.8,
  },
  thirdScore: {
    color: THEME.TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: "700",
    opacity: 0.6,
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    gap: 20,
    marginBottom: 60,
  },
  menuContainer: {
    width: "100%",
    paddingHorizontal: 40,
    gap: 16,
    alignItems: "center",
  },
  button: {
    width: "100%",
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 22,
    fontWeight: "900",
    color: THEME.BUTTON_TEXT,
    letterSpacing: 1,
  },
  newGameText: {
    color: THEME.BUTTON_TEXT,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.TEXT_SECONDARY,
    marginTop: 4,
  },
  version: {
    color: THEME.TEXT_MUTED,
    fontSize: 12,
  },
});
