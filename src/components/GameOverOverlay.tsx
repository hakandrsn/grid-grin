// src/components/GameOverOverlay.tsx
import { showInterstitial } from "@/services/adManager";
import { useAdActions } from "@/src/store/adStore";
import { useGameStore } from "@/src/store/useGameStore";
import { THEME } from "@/src/utils/constants";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface GameOverOverlayProps {
  onContinue: () => void;
  onReset: () => void;
}

export const GameOverOverlay = ({
  onContinue,
  onReset,
}: GameOverOverlayProps) => {
  const leaderboard = useGameStore((state) => state.leaderboard);
  const score = useGameStore((state) => state.score);
  const canContinue = score >= 500;

  // States
  const [phase, setPhase] = useState<"splash" | "menu">("splash");
  const [loadingAd, setLoadingAd] = useState(false);

  // Ad Logic
  const { canShowInterstitial, markInterstitialShown } = useAdActions();

  // Animation Values
  const shake = useSharedValue(0);

  useEffect(() => {
    // Stage 1: Show Splash for 2 seconds
    const timer = setTimeout(() => {
      setPhase("menu");
    }, 2000);

    // Trigger "Ufak bounce ile sallanma" (Small shake/bounce)
    // Sequence: Wait slightly, then small rotate shake
    shake.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 100 }),
        withTiming(-15, { duration: 100 }),
        withTiming(0, { duration: 100 }),
      ),
      2, // Repeat twice
      true, // Reverse
    );

    return () => clearTimeout(timer);
  }, [shake]);

  const handleNewGame = async () => {
    if (loadingAd) return;

    // Check strict cooldown (2 mins) - passing placeholder args as we made it generic-ish
    if (canShowInterstitial(1, 1)) {
      setLoadingAd(true);
      const watched = await showInterstitial();
      if (watched) {
        markInterstitialShown();
      }
      setLoadingAd(false);
    }

    onReset();
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: shake.value }], // Vertical bounce/shake
    };
  });

  // RENDER: SPLASH PHASE
  if (phase === "splash") {
    return (
      <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0)" }]}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(300)}
          style={animatedStyle}
        >
          <Image
            source={require("@/assets/images/streak/game-over.png")}
            style={styles.splashImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    );
  }

  // RENDER: MENU PHASE
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.overlay}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>OYUN BİTTİ!</Text>
        <Text style={styles.score}>{score}</Text>

        {/* Lider Tablosu */}
        <View style={styles.leaderboard}>
          <Text style={styles.lbTitle}>🏆 EN İYİLER 🏆</Text>
          {leaderboard.map((s, i) => (
            <View key={i} style={styles.lbRow}>
              <Text style={styles.lbRank}>{i + 1}.</Text>
              <Text style={styles.lbScore}>{s > 0 ? s : "---"}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          {/* Continue Section */}
          <View style={styles.continueSection}>
            <Text style={styles.description}>
              Parçalar yenilenir ve oyun kaldığı yerden devam eder.
            </Text>
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                !canContinue && styles.disabledButton,
              ]}
              onPress={canContinue ? onContinue : undefined}
              activeOpacity={canContinue ? 0.7 : 1}
            >
              <Text
                style={[styles.buttonText, !canContinue && styles.disabledText]}
              >
                DEVAM ET (-500 Puan)
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleNewGame}
            disabled={loadingAd}
          >
            <Text style={[styles.buttonText, { color: "#fff" }]}>
              {loadingAd ? "YÜKLENİYOR..." : "YENİ OYUN BAŞLAT"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(48, 54, 79, 0.98)", // THEME.BACKGROUND with opacity
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  contentContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  title: {
    color: THEME.TEXT_PRIMARY,
    fontSize: 42,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: 1,
  },
  score: {
    color: THEME.TEXT_SECONDARY, // Beige instead of Cyan
    fontSize: 80,
    fontWeight: "900",
    marginBottom: 40,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  leaderboard: {
    width: "100%",
    backgroundColor: THEME.SURFACE,
    borderRadius: 24,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  lbTitle: {
    color: THEME.TEXT_MUTED,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    letterSpacing: 2,
    marginTop: 5,
  },
  lbRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  lbRank: { color: THEME.TEXT_MUTED, fontSize: 20, fontWeight: "600" },
  lbScore: { color: THEME.TEXT_PRIMARY, fontSize: 20, fontWeight: "700" },

  actions: { width: "100%", gap: 20 },
  continueSection: { gap: 8, width: "100%" },
  description: {
    color: THEME.TEXT_MUTED,
    fontSize: 13,
    textAlign: "center",
    fontStyle: "italic",
  },
  button: {
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: THEME.SURFACE_LIGHT,
    borderWidth: 1,
    borderColor: THEME.TEXT_SECONDARY,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: THEME.SURFACE_LIGHT,
  },
  disabledButton: {
    backgroundColor: THEME.SURFACE,
    borderColor: "transparent",
    shadowOpacity: 0,
  },
  buttonText: {
    color: THEME.TEXT_PRIMARY,
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  disabledText: { color: THEME.TEXT_MUTED },
  splashImage: {
    width: "90%",
    aspectRatio: 1,
    height: undefined,
  },
});
