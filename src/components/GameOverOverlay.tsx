// src/components/GameOverOverlay.tsx
import { showInterstitial } from "@/services/adManager";
import { useAdActions, useAdStore } from "@/src/store/adStore";
import { useGameStore } from "@/src/store/useGameStore";
import { THEME } from "@/src/utils/constants";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeOut,
  SlideInLeft,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface GameOverOverlayProps {
  onContinue: () => void;
  onContinueWithAd: () => void;
  onReset: () => void;
}

export const GameOverOverlay = ({
  onContinue,
  onContinueWithAd,
  onReset,
}: GameOverOverlayProps) => {
  const leaderboard = useGameStore((state) => state.leaderboard);
  const score = useGameStore((state) => state.score);
  const canContinue = score >= 500;

  const [phase, setPhase] = useState<"splash" | "menu">("splash");
  const [loadingAd, setLoadingAd] = useState(false);
  const { markInterstitialShown } = useAdActions();
  const isAdReady = useAdStore((state) => state.isInterstitialReady);

  const modalScale = useSharedValue(0);

  useEffect(() => {
    // 2 saniye splash göster, sonra modal aç
    const timer = setTimeout(() => {
      setPhase("menu");
      // Düz scale animasyonu (bounce yok)
      modalScale.value = withTiming(1, { duration: 400 });
    }, 2000);

    return () => clearTimeout(timer);
  }, [modalScale]);

  // Sıralama hesapla
  const getRankInfo = () => {
    if (score >= leaderboard[0] && leaderboard[0] > 0) {
      return { text: "🏆 YENİ REKOR!", color: "#FFD700" };
    } else if (score >= leaderboard[1] && leaderboard[1] > 0) {
      return { text: "🥈 2. EN İYİ SKORUN!", color: "#C0C0C0" };
    } else if (score >= leaderboard[2] && leaderboard[2] > 0) {
      return { text: "🥉 3. EN İYİ SKORUN!", color: "#CD7F32" };
    }
    return null;
  };

  const rankInfo = getRankInfo();

  const handleNewGame = () => {
    onReset();
  };

  const handleContinueWithAd = async () => {
    if (loadingAd) return;

    setLoadingAd(true);
    try {
      const watched = await showInterstitial();
      setLoadingAd(false);

      if (watched) {
        markInterstitialShown();
        onContinueWithAd();
      }
      // Reklam izlenmediyse hiçbir şey yapma (modal açık kalır)
    } catch {
      setLoadingAd(false);
      // Reklam hatası - modal açık kalır
    }
  };

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
  }));

  // SPLASH PHASE - Game Over Image
  if (phase === "splash") {
    return (
      <View style={styles.overlay}>
        <Animated.View
          entering={SlideInLeft.duration(200)}
          exiting={FadeOut.duration(150)}
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

  // MENU PHASE - Modal
  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.modal, modalAnimatedStyle]}>
        {/* Header */}
        <Text style={styles.gameOverText}>OYUN BİTTİ</Text>

        {/* Big Score */}
        <Text style={styles.scoreText}>{score.toLocaleString()}</Text>

        {/* Rank Info */}
        {rankInfo && (
          <Text style={[styles.rankText, { color: rankInfo.color }]}>
            {rankInfo.text}
          </Text>
        )}

        {/* Buttons Row */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.continueButton,
              !canContinue && styles.disabledButton,
            ]}
            onPress={canContinue ? onContinue : undefined}
            activeOpacity={canContinue ? 0.7 : 1}
          >
            <Text
              style={[styles.buttonText, !canContinue && styles.disabledText]}
            >
              DEVAM ET
            </Text>
            <Text
              style={[
                styles.buttonSubtext,
                !canContinue && styles.disabledText,
              ]}
            >
              -500 puan · Yeni parçalar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.newGameButton]}
            onPress={handleNewGame}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>YENİ OYUN</Text>
          </TouchableOpacity>
        </View>

        {/* Ad Continue Button */}
        <TouchableOpacity
          style={[
            styles.adButton,
            (loadingAd || !isAdReady) && styles.disabledAdButton,
          ]}
          onPress={handleContinueWithAd}
          disabled={loadingAd || !isAdReady}
          activeOpacity={0.7}
        >
          <Text style={styles.adButtonText}>
            {loadingAd
              ? "⏳ REKLAM AÇILIYOR..."
              : isAdReady
                ? "🎬 REKLAM İZLE VE DEVAM ET"
                : "⏳ REKLAM YÜKLENİYOR..."}
          </Text>
          <Text style={styles.adButtonSubtext}>Ücretsiz yeni parçalar</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  splashImage: {
    width: 300,
    height: 300,
  },
  modal: {
    width: "88%",
    backgroundColor: THEME.SURFACE,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 3,
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 72,
    fontWeight: "900",
    color: THEME.TEXT_SECONDARY,
    marginBottom: 8,
  },
  rankText: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 24,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginBottom: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButton: {
    backgroundColor: THEME.BUTTON_PRIMARY,
  },
  newGameButton: {
    backgroundColor: THEME.SURFACE_LIGHT,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  disabledButton: {
    backgroundColor: "#333",
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
  },
  buttonSubtext: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  disabledText: {
    color: "rgba(255, 255, 255, 0.4)",
  },
  adButton: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#4CAF50",
  },
  disabledAdButton: {
    backgroundColor: "#666",
    opacity: 0.7,
  },
  adButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
  adButtonSubtext: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
});
