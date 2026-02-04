import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useGameStore } from "../store/useGameStore";

// Streak görselleri
const STREAK_IMAGES = {
  good: require("../../assets/images/streak/good.png"),
  sweet: require("../../assets/images/streak/sweet.png"),
  perfect: require("../../assets/images/streak/perfect.png"),
  perfect_streak: require("../../assets/images/streak/perfect-streak.png"),
};

export const StreakOverlay = () => {
  const streak = useGameStore((state) => state.streak);
  const milestoneEvent = useGameStore((state) => state.milestoneEvent);
  const clearMilestone = useGameStore((state) => state.clearMilestone);

  const [activeImage, setActiveImage] = useState<any>(null);
  const lastShownStreak = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scale = useSharedValue(0);
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    let img = null;
    let shouldShow = false;

    // 1. Milestone Priority (High Priority)
    if (milestoneEvent) {
      if (milestoneEvent === "sweet") img = STREAK_IMAGES.sweet;
      else if (milestoneEvent === "good") img = STREAK_IMAGES.good;
      else if (milestoneEvent === "perfect") img = STREAK_IMAGES.perfect;

      shouldShow = !!img;
      // Milestone gösterildiğinde streak'i de "görmüş" sayalım ki
      // arkasından hemen bir daha streak animasyonu (örn: good) tetiklenmesin
      if (shouldShow) {
        lastShownStreak.current = streak;
        // Event'i store'dan temizle ki sürekli tekrar etmesin
        clearMilestone();
      }
    }
    // 2. Streak Priority (Low Priority - eğer milestone yoksa)
    else if (streak >= 2 && streak > lastShownStreak.current) {
      if (streak >= 10) img = STREAK_IMAGES.perfect_streak;
      else if (streak >= 7) img = STREAK_IMAGES.perfect;
      else if (streak >= 4) img = STREAK_IMAGES.sweet;
      else if (streak >= 2) img = STREAK_IMAGES.good;

      shouldShow = !!img;
      if (shouldShow) {
        lastShownStreak.current = streak;
      }
    }

    // Streak sıfırlanırsa tracker'ı resetle
    if (streak === 0) {
      lastShownStreak.current = 0;
    }

    if (shouldShow && img) {
      // Önceki bekleyen kapanma işlemini iptal et
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Yeni imajı set et
      setActiveImage(img);

      // Animasyon Değerlerini Sıfırla (Re-trigger)
      scale.value = 0;
      translateY.value = 50; // Hafif aşağıdan gelsin
      opacity.value = 1;

      // Animasyonu Başlat: Küçükten büyüyüp (1.2), hafif küçülüp (1.0) duracak.
      // Easing.out(Easing.quad) varsayılan olarak withTiming içinde kullanılabilir,
      // ama default linear/quad arası genelde iyidir.
      scale.value = withSequence(
        withTiming(1.2, { duration: 250 }), // Hızlıca büyü
        withTiming(1, { duration: 150 }), // Hafifçe yerine otur
      );

      // Y ekseni de smooth bir şekilde yerine gelsin, bounce olmadan
      translateY.value = withTiming(0, { duration: 300 });

      // 1.5 saniye sonra kapat
      timeoutRef.current = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(setActiveImage)(null);
        });
      }, 1500);
    }

    return () => {
      // Unmount veya re-run durumunda timeout temizliği
      // Ancak buraya dikkat: useEffect dependency değişiminde animasyonu kesmemeliyiz
      // Sadece component unmount oluyorsa temizleyelim mi?
      // Hayır, yeni efekt geldiğinde üstteki `if (shouldShow)` bloğu zaten timeout'u temizliyor.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streak, milestoneEvent]); // Store değişimlerini dinle

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!activeImage) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={style}>
        <Image source={activeImage} style={styles.image} contentFit="contain" />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    marginTop: -100,
  },
  image: {
    width: 300,
    height: 150,
  },
});
