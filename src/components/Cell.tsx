// src/components/Cell.tsx
import React, { memo, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { CELL_SIZE } from "../utils/constants";

interface CellProps {
  row: number;
  col: number;
  color: string | null;
}

const Cell = ({ row, col, color }: CellProps) => {
  const blockScale = useSharedValue(color ? 1 : 0);
  const blockOpacity = useSharedValue(color ? 1 : 0);

  // Logic tracking for transitions
  const prevColor = useRef(color);

  // Visual persistence for clear animation
  const lastValidColor = useRef(color);
  if (color) lastValidColor.current = color;

  // Flash / Burst Animation State
  const flashScale = useSharedValue(0.8);
  const flashOpacity = useSharedValue(0);

  useEffect(() => {
    // 1. Silinme (Puff) & Flash Animasyonu
    if (color === null && prevColor.current !== null) {
      // Cell: Hafifçe büyüyüp içine çökme (Implosion effect)
      blockScale.value = withSequence(
        withTiming(1.1, { duration: 50 }),
        withTiming(0, { duration: 200, easing: Easing.inOut(Easing.quad) }),
      );
      blockOpacity.value = withTiming(0, { duration: 200 });

      // Flash: Patlama efekti (Daha derli toplu)
      flashScale.value = 0.8;
      flashOpacity.value = 1;

      flashScale.value = withTiming(1.4, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      });
      flashOpacity.value = withTiming(0, { duration: 300 });
    }
    // 2. Yeni blok yerleştirildiğinde (Animasyonsuz, direkt görünüm)
    else if (color !== null && prevColor.current === null) {
      blockScale.value = 1;
      blockOpacity.value = 1;
    }
    // 3. Başlangıç veya Reset durumu
    else if (color !== null) {
      blockScale.value = 1;
      blockOpacity.value = 1;
    }

    prevColor.current = color;
  }, [color, blockOpacity, blockScale, flashOpacity, flashScale]);

  const animatedBlockStyle = useAnimatedStyle(() => {
    return {
      // backgroundColor style prop'undan gelecek
      transform: [{ scale: blockScale.value }],
      opacity: blockOpacity.value,
    };
  });

  const animatedFlashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
    transform: [{ scale: flashScale.value }],
    backgroundColor: "white", // Flash her zaman beyaz parlama
  }));

  const displayColor = color || lastValidColor.current || "transparent";

  return (
    <View style={styles.cellContainer}>
      {/* Sabit Grid Arka Planı */}
      <View style={styles.emptyGrid} />

      {/* Animasyonlu Blok veya Önizleme Katmanı */}
      <Animated.View
        style={[
          styles.block,
          { backgroundColor: displayColor },
          animatedBlockStyle,
        ]}
      />

      {/* Patlama Efekti (Flash) - Sadece yok olurken görünür */}
      <Animated.View
        style={[styles.flash, animatedFlashStyle]}
        pointerEvents="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cellContainer: {
    width: CELL_SIZE - 2,
    height: CELL_SIZE - 2,
    margin: 1,
    position: "relative",
    backgroundColor: "transparent",
  },
  emptyGrid: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 6, // Slightly clearer roundness
    // No border here to avoid layout calc issues, or constant border.
    // Let's use a very subtle border consistently.
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  block: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 4,
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 4,
    zIndex: 10,
    backgroundColor: "white",
  },
});

export default memo(Cell);
