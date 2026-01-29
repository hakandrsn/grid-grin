import { initializeAds } from "@/services/adManager";
import React, { useEffect } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface CustomSplashScreenProps {
  onFinish: () => void;
}

const { width } = Dimensions.get("window");
const LOGO_SIZE = width * 0.4;
const BAR_WIDTH = width * 0.7;
const BAR_HEIGHT = 8;

export const CustomSplashScreen = ({ onFinish }: CustomSplashScreenProps) => {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(1);
  const logoScale = useSharedValue(0.8);

  useEffect(() => {
    // 1. Initialize Ads and other background tasks
    initializeAds();

    // 2. Start Animations
    logoScale.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.back(1.5)),
    });

    progress.value = withTiming(
      1,
      { duration: 2500, easing: Easing.inOut(Easing.quad) },
      (finished) => {
        if (finished) {
          // Fade out everything
          opacity.value = withTiming(0, { duration: 500 }, (faded) => {
            if (faded) {
              runOnJS(onFinish)();
            }
          });
        }
      },
    );
  }, []);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: progress.value * BAR_WIDTH,
  }));

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <Animated.View style={animatedLogoStyle}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Text style={styles.title}>GRID GRIN</Text>

      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, animatedProgressStyle]} />
      </View>

      <Text style={styles.loadingText}>Yükleniyor...</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#121214", // Dark theme background
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 50,
    letterSpacing: 2,
  },
  progressContainer: {
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: BAR_HEIGHT / 2,
    overflow: "hidden",
    marginBottom: 15,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#00E0FF", // Neon Cyan
    borderRadius: BAR_HEIGHT / 2,
  },
  loadingText: {
    color: "#666",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
