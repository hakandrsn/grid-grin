// src/components/Piece.tsx
import React, { memo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { usePreview } from "../context/PreviewContext";
import { useGameStore } from "../store/useGameStore";
import { BOARD_SIZE } from "../utils/constants";

const { width } = Dimensions.get("window");
const CELL_SIZE = (width - 40) / BOARD_SIZE;
const PREVIEW_OFFSET_Y = 220; // Daha yukarıda, parmak altında kalmaz

const Piece = ({
  id,
  shape,
  color,
}: {
  id: string;
  shape: number[][];
  color: string;
}) => {
  const onDrop = useGameStore((state) => state.onDrop);
  const boardLayout = useGameStore((state) => state.boardLayout);

  const { activePreview } = usePreview();

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const grabX = useSharedValue(0);
  const grabY = useSharedValue(0);
  // lastRow/lastCol removed as we update SharedValue directly on every frame without cost

  const gesture = Gesture.Pan()
    .onStart((e) => {
      isDragging.value = true;
      grabX.value = e.x;
      grabY.value = e.y;
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;

      if (boardLayout) {
        const absX = e.absoluteX - grabX.value;
        const absY = e.absoluteY - grabY.value - PREVIEW_OFFSET_Y;

        // Snapping: Parça hücrenin %40'ına girdiğinde (0.4) yakala.
        // Math.round standart olarak 0.5'te çalışır.
        // Kullanıcı daha "responsive" hissetmek istiyor.
        // Ancak simetrik olması için Math.round en doğrusudur.
        // Lag kalktığında bu his düzelecektir.
        const col = Math.round((absX - (boardLayout.x + 5)) / CELL_SIZE);
        const row = Math.round((absY - (boardLayout.y + 5)) / CELL_SIZE);

        activePreview.value = { row, col, shape, color };
      }
    })
    .onEnd((e) => {
      isDragging.value = false;
      activePreview.value = null; // Reset preview

      if (boardLayout) {
        const absX = e.absoluteX - grabX.value;
        const absY = e.absoluteY - grabY.value - PREVIEW_OFFSET_Y;
        const col = Math.round((absX - (boardLayout.x + 5)) / CELL_SIZE);
        const row = Math.round((absY - (boardLayout.y + 5)) / CELL_SIZE);
        scheduleOnRN(onDrop, id, shape, row, col, color);
      }
      translateX.value = withTiming(0, {
        duration: 150,
        easing: Easing.out(Easing.quad),
      });
      translateY.value = withTiming(0, {
        duration: 150,
        easing: Easing.out(Easing.quad),
      });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: withTiming(isDragging.value ? 1.05 : 0.8, { duration: 150 }) },
    ],
    zIndex: isDragging.value ? 1000 : 1,
    opacity: withTiming(isDragging.value ? 0.9 : 1, { duration: 150 }),
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animatedStyle}>
        {shape.map((r, ri) => (
          <View key={ri} style={{ flexDirection: "row" }}>
            {r.map((c, ci) => (
              <View
                key={ci}
                style={[
                  styles.cell,
                  {
                    backgroundColor: c ? color : "transparent",
                    opacity: c ? 1 : 0,
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  cell: {
    width: CELL_SIZE - 2,
    height: CELL_SIZE - 2,
    margin: 1,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
});

export default memo(Piece);
