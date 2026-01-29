import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
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

  const scale = useSharedValue(0);
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    let img = null;

    // 1. Milestone Öncelikli (Rekor)
    if (milestoneEvent) {
      if (milestoneEvent === "sweet") img = STREAK_IMAGES.sweet;
      else if (milestoneEvent === "good") img = STREAK_IMAGES.good;
      else if (milestoneEvent === "perfect") img = STREAK_IMAGES.perfect;

      clearMilestone(); // Event'i resetle
    }
    // 2. Normal Streak
    else if (streak >= 2) {
      if (streak >= 10) img = STREAK_IMAGES.perfect_streak;
      else if (streak >= 7) img = STREAK_IMAGES.perfect;
      else if (streak >= 4) img = STREAK_IMAGES.sweet;
      else if (streak >= 2) img = STREAK_IMAGES.good;
    }

    if (img) {
      setActiveImage(img);
      scale.value = 0;
      translateY.value = 50;
      opacity.value = 1;

      scale.value = withSpring(1);
      translateY.value = withSpring(0);

      // 1.5 saniye sonra kaybol
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(setActiveImage)(null);
        });
      }, 1500);
    }
  }, [
    streak,
    milestoneEvent,
    activeImage,
    clearMilestone,
    opacity,
    scale,
    translateY,
  ]);

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
    marginTop: -100, // Board'un biraz üzerinde olsun
  },
  image: {
    width: 300,
    height: 150,
  },
});
