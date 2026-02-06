import { showInterstitial } from "@/services/adManager";
import GameBannerAd from "@/src/components/ads/GameBannerAd";
import { GameOverOverlay } from "@/src/components/GameOverOverlay";
import Piece from "@/src/components/Piece";
import { StreakOverlay } from "@/src/components/StreakOverlay";
import { useAdActions } from "@/src/store/adStore";
import { useGameStore } from "@/src/store/useGameStore";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  AppState,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Board } from "../src/components/Board";
import { ScoreBoard } from "../src/components/ScoreBoard";
import { THEME } from "../src/utils/constants";

export default function Game() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const appState = useRef(AppState.currentState);
  const availablePieces = useGameStore((state) => state.availablePieces);
  const isGameOver = useGameStore((state) => state.isGameOver);
  const refreshPieces = useGameStore((state) => state.refreshPieces);
  const resetGame = useGameStore((state) => state.resetGame);
  const continueWithNewPieces = useGameStore(
    (state) => state.continueWithNewPieces,
  );
  const continueWithAd = useGameStore((state) => state.continueWithAd);
  const saveGame = useGameStore((state) => state.saveGame);
  const { canShowInterstitial } = useAdActions();
  const [adCountdown, setAdCountdown] = React.useState<number | null>(null);

  // Ad Timer logic
  useEffect(() => {
    // Check every 5 seconds
    const interval = setInterval(() => {
      // 1. Is it time for an ad?
      // 2. Are we NOT currently showing a countdown?
      // 3. Is the user NOT dragging a piece?
      if (
        canShowInterstitial() &&
        adCountdown === null &&
        !useGameStore.getState().isDragging
      ) {
        setAdCountdown(3);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [canShowInterstitial, adCountdown]);

  // Countdown effect
  useEffect(() => {
    if (adCountdown === null) return;

    if (adCountdown > 0) {
      const timer = setTimeout(() => {
        setAdCountdown((prev) => (prev ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown reached 0
      const showAd = async () => {
        // Final safety check: if dragging, abort
        if (useGameStore.getState().isDragging) {
          setAdCountdown(null);
        } else {
          await showInterstitial();
          setAdCountdown(null);
        }
      };
      showAd();
    }
  }, [adCountdown]);

  // Initial Load (if coming directly or reload)
  useEffect(() => {
    // Safety check: If no pieces are present (e.g. fresh reload directly to game), generate them.
    if (availablePieces.length === 0 && !isGameOver) {
      refreshPieces();
    }

    // AppState listener for Autosave
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App returned to foreground
      } else if (nextAppState.match(/inactive|background/)) {
        // App going to background -> Save
        saveGame();
      }
      appState.current = nextAppState;
    });

    return () => {
      saveGame(); // Also save on unmount (back to menu)
      subscription.remove();
    };
  }, [availablePieces.length, isGameOver, refreshPieces, saveGame]);

  const handleBack = async () => {
    await saveGame();
    router.replace("/");
  };

  return (
    <View style={[styles.container]}>
      <View style={{ flex: 1, paddingTop: top + 20 }}>
        {/* Header Area */}
        <View style={styles.header}>
          {/* Back Button (Left) */}
          <TouchableOpacity
            onPress={handleBack}
            style={styles.headerButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          {/* ScoreBoard (Center) */}
          <ScoreBoard />

          {/* Restart Button (Right) */}
          <TouchableOpacity
            onPress={resetGame}
            style={styles.headerButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.gameArea}>
          <Board />
        </View>
        <View style={styles.pieceArea}>
          {availablePieces.map((piece) => (
            <View key={piece.id} style={styles.pieceContainer}>
              <Piece {...piece} />
            </View>
          ))}
        </View>
      </View>

      {/* Banner Ad Section */}
      <View
        style={{
          backgroundColor: THEME.BACKGROUND,
          width: "100%",
          minHeight: 50,
        }}
      >
        <GameBannerAd />
      </View>

      <StreakOverlay />

      {/* Ad Countdown Overlay - Premium Glassmorphism */}
      {adCountdown !== null && (
        <View style={styles.adCountdownWrapper} pointerEvents="none">
          <BlurView intensity={20} tint="dark" style={styles.adCountdownBlur}>
            <Ionicons name="time-outline" size={20} color={THEME.ACCENT} />
            <Text style={styles.adCountdownLabel}>Reklam</Text>
            <View style={styles.adSeparator} />
            <Text style={styles.adCountdownText}>{adCountdown}</Text>
          </BlurView>
        </View>
      )}

      {isGameOver && (
        <GameOverOverlay
          onContinue={continueWithNewPieces}
          onContinueWithAd={continueWithAd}
          onReset={resetGame}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.BACKGROUND,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    width: "100%",
  },
  headerButton: {
    padding: 12,
    backgroundColor: THEME.SURFACE_LIGHT, // Lighter than BG
    borderRadius: 16,
    // borderWidth: 1, // Removed border for cleaner look, or keep?
    // borderColor: "rgba(255,255,255,0.05)",
  },
  gameArea: {
    flex: 1, // Allow board to take available space (constrained by CELL_SIZE)
    justifyContent: "center",
    alignItems: "center",
  },
  pieceArea: {
    height: 150,
    width: "100%",
    // Background removed
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
    paddingBottom: 20, // Push slightly up
  },
  pieceContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  gameOverText: { color: "#fff", fontSize: 40, fontWeight: "900" },
  // resetButton removed (duplicate)
  resetButtonText: { color: "#000", fontWeight: "bold", fontSize: 18 },
  gameOverTitle: {
    color: "#fff",
    fontSize: 44,
    fontWeight: "900",
    marginBottom: 10,
  },
  finalScoreText: {
    color: "#00ffcc",
    fontSize: 60,
    fontWeight: "900",
    marginBottom: 40,
  },
  buttonContainer: { width: "80%", gap: 15 },
  actionButton: { padding: 20, borderRadius: 15, alignItems: "center" },
  actionButtonText: { color: "#000", fontWeight: "bold", fontSize: 16 },
  adCountdownWrapper: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    zIndex: 9999,
    borderRadius: 30,
    overflow: "hidden", // Required for BlurView rounded corners
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  adCountdownBlur: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: "rgba(0,0,0,0.6)", // Slight tint on top of blur
  },
  adCountdownLabel: {
    color: "#fff",
    fontSize: 18, // Slightly larger
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  adSeparator: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  adCountdownText: {
    color: THEME.ACCENT,
    fontSize: 26,
    fontWeight: "900",
    fontVariant: ["tabular-nums"], // Fixed width numbers to prevent jitter
  },
});
