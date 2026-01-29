import React, { memo, useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface PuffExplosionProps {
  color: string;
  onComplete: () => void;
}

const PARTICLE_COUNT = 8;
const EXPLOSION_OFFSET = 30;

// Optimize by running one single animation for the whole container
const PuffExplosionComponent = ({ color, onComplete }: PuffExplosionProps) => {
  const progress = useSharedValue(0);

  // Pre-calculate random properties for particles so they are static during renders
  const particlesConfig = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
      const angle = (360 / PARTICLE_COUNT) * i;
      // Slight randomness for "organic" feel
      const extraDist = Math.random() * 10;
      // Delay simulated by start range in interpolation
      const startDelay = Math.random() * 0.2;

      return {
        key: i,
        angle: (angle * Math.PI) / 180, // Convert to radians
        rotation: angle,
        extraDist,
        startDelay,
      };
    });
  }, []);

  useEffect(() => {
    // Single driver for all particles
    progress.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.quad),
    });
    // Fallback safety to ensure cleanup happens
    const t = setTimeout(onComplete, 550);
    return () => clearTimeout(t);
  }, [onComplete, progress]);

  // Shockwave Style
  const shockwaveStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: interpolate(progress.value, [0, 1], [0.5, 2]) }],
      opacity: interpolate(progress.value, [0, 0.5, 1], [0.8, 0.5, 0]),
      borderColor: color,
    };
  });

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Single Shockwave */}
      <Animated.View style={[styles.shockwave, shockwaveStyle]} />

      {/* Particles mapped directly here to avoid sub-component overhead */}
      {particlesConfig.map((p) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const pStyle = useAnimatedStyle(() => {
          // Map global progress to local particle progress based on startDelay
          // 0 -> startDelay -> 1
          // If progress < startDelay, localP = 0
          const localProgress = interpolate(
            progress.value,
            [p.startDelay, 1],
            [0, 1],
            "clamp",
          );

          const dist = EXPLOSION_OFFSET + p.extraDist;
          const x = localProgress * dist * Math.cos(p.angle);
          const y = localProgress * dist * Math.sin(p.angle);

          const scale = interpolate(localProgress, [0, 0.7], [1, 0], "clamp");

          return {
            opacity: 1 - localProgress,
            transform: [
              { translateX: x },
              { translateY: y },
              { scale },
              { rotate: `${p.rotation}deg` },
            ],
            backgroundColor: color,
          };
        });

        return <Animated.View key={p.key} style={[styles.particle, pStyle]} />;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  particle: {
    width: 6,
    height: 6,
    position: "absolute",
    borderRadius: 2,
  },
  shockwave: {
    position: "absolute",
    width: "80%",
    height: "80%",
    borderWidth: 2,
    borderRadius: 4,
  },
});

export const PuffExplosion = memo(PuffExplosionComponent);
