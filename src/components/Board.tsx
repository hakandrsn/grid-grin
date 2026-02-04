// src/components/Board.tsx
import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useGameStore } from "../store/useGameStore";
import { THEME } from "../utils/constants";
import Cell from "./Cell";

export const Board = () => {
  const viewRef = useRef<View>(null);
  const setBoardLayout = useGameStore((state) => state.setBoardLayout);
  const board = useGameStore((state) => state.board);
  const streak = useGameStore((state) => state.streak);

  // Board titremesini kaldırıyoruz (User requested: "titreme olmasın board sabit kalsın")
  const pulse = useSharedValue(0);

  useEffect(() => {
    // Streak varsa çerçeve yanıp sönsün (Pulsation)
    if (streak > 0) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0.4, { duration: 600 }),
        ),
        -1, // Infinite repeat
        true, // Reverse
      );
    } else {
      pulse.value = 0; // Reset
    }
  }, [streak, pulse]);

  const animatedBorderStyle = useAnimatedStyle(() => {
    // Basit bir renk geçişi (Streak yokken sabit, varken renkli)
    const baseColor = "#333";
    const activeColor = streak > 5 ? "#ffcc00" : "#00ffcc"; // High streak = Gold, Low = Green

    // Streak yoksa pulse etkisi olmasın
    const borderColor =
      streak > 0
        ? interpolateColor(pulse.value, [0, 1], [baseColor, activeColor])
        : baseColor;

    // Gölge efekti de pulse ile uyumlu olsun
    const shadowOpacity = streak > 0 ? pulse.value * 0.8 : 0;
    const shadowRadius = streak > 0 ? 10 : 0;
    const borderWidth = streak > 0 ? 3 : 1; // Subtle border normally

    return {
      borderColor,
      borderWidth,
      shadowColor: activeColor,
      shadowOpacity,
      shadowRadius,
      shadowOffset: { width: 0, height: 0 },
      // transform: [{ translateX: shake.value }] // REMOVED SHAKE
    };
  });
  const layoutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (layoutTimeoutRef.current) clearTimeout(layoutTimeoutRef.current);
    };
  }, []);

  const handleLayout = () => {
    // Measure the exact position of gridInner where cells actually start
    if (layoutTimeoutRef.current) clearTimeout(layoutTimeoutRef.current);

    layoutTimeoutRef.current = setTimeout(() => {
      viewRef.current?.measureInWindow((x, y, width) => {
        if (width > 0) {
          // Now x,y points to where cells begin (inside padding)
          setBoardLayout({ x, y, size: width });
        }
      });
    }, 500);
  };
  return (
    <Animated.View style={[styles.container, animatedBorderStyle]}>
      <View ref={viewRef} onLayout={handleLayout} style={styles.gridInner}>
        {board.map((row, rIdx) => (
          <View key={rIdx} style={styles.row}>
            {row.map((cellColor, cIdx) => (
              <Cell
                key={`${rIdx}-${cIdx}`}
                row={rIdx}
                col={cIdx}
                color={cellColor}
              />
            ))}
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.SURFACE,
    borderRadius: 8,
    overflow: "hidden",
  },
  gridInner: {
    padding: 2, // Very minimal consistent padding
  },
  row: { flexDirection: "row" },
});
