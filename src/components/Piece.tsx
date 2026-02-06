// src/components/Piece.tsx
import React, { memo, useCallback, useEffect, useRef } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useGameStore } from "../store/useGameStore";
import { BOARD_SIZE, CELL_SIZE } from "../utils/constants";

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
  const canPlacePiece = useGameStore((state) => state.canPlacePiece);
  const setIsDragging = useGameStore((state) => state.setIsDragging);

  // Screen Dimensions for Slot Calculation
  const { width } = Dimensions.get("window");
  const SLOT_WIDTH = (width - 40) / 3; // 3 slots with some padding

  // Calculate Piece Dimensions
  const pieceWidth = shape[0].length * CELL_SIZE;
  const pieceHeight = shape.length * CELL_SIZE;

  // Calculate Scale to fit in slot (with 10% padding margin)
  const fitScale = Math.min(1, (SLOT_WIDTH * 0.9) / pieceWidth);

  // Refs for measurement
  const pieceRef = useRef<View>(null);
  const homeX = useRef(0);
  const homeY = useRef(0);

  // Animated values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  // Animasyonlu scale değeri (başlangıçta fitScale)
  const scale = useSharedValue(fitScale);

  const layoutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Parça değiştiğinde veya mount olduğunda scale'i güncelle
    scale.value = withTiming(fitScale, { duration: 300 });

    return () => {
      if (layoutTimeoutRef.current) clearTimeout(layoutTimeoutRef.current);
    };
  }, [fitScale, scale]);

  // Parçanın başlangıç pozisyonunu ölç
  const handleLayout = useCallback(() => {
    if (layoutTimeoutRef.current) clearTimeout(layoutTimeoutRef.current);

    layoutTimeoutRef.current = setTimeout(() => {
      pieceRef.current?.measureInWindow((x, y) => {
        if (x !== undefined && y !== undefined) {
          homeX.current = x;
          homeY.current = y;
        }
      });
    }, 100);
  }, []);

  // --- JS Thread Handler ---
  const handleDragEnd = (translationX: number, translationY: number) => {
    setIsDragging(false);
    let placed = false;

    if (boardLayout && homeX.current !== 0) {
      const pieceScreenX = homeX.current + translationX;
      const pieceScreenY = homeY.current + translationY;

      const boardOriginX = boardLayout.x;
      const boardOriginY = boardLayout.y;

      // Scale Offset Adjustments
      // When scale becomes 1, the top-left corner shifts.
      // We measured homeX at fitScale.
      // Shift amount = (FullSize - ScaledSize) / 2
      const scaleOffset = (pieceWidth * (1 - fitScale)) / 2;
      const scaleOffsetY = (pieceHeight * (1 - fitScale)) / 2;

      const effectiveX = pieceScreenX - scaleOffset;
      const effectiveY = pieceScreenY - scaleOffsetY;

      const floatCol = (effectiveX - boardOriginX) / CELL_SIZE;
      const floatRow = (effectiveY - boardOriginY) / CELL_SIZE;

      let bestCandidate = null;
      let maxScore = -Infinity;

      // Rough Bounds Check
      if (
        pieceScreenX >= boardOriginX - CELL_SIZE &&
        pieceScreenX <= boardOriginX + BOARD_SIZE * CELL_SIZE &&
        pieceScreenY >= boardOriginY - CELL_SIZE &&
        pieceScreenY <= boardOriginY + BOARD_SIZE * CELL_SIZE
      ) {
        // Scan candidates
        const candidates = [
          { r: Math.round(floatRow), c: Math.round(floatCol) },
          { r: Math.floor(floatRow), c: Math.floor(floatCol) },
          { r: Math.ceil(floatRow), c: Math.ceil(floatCol) },
          { r: Math.floor(floatRow), c: Math.ceil(floatCol) },
          { r: Math.ceil(floatRow), c: Math.floor(floatCol) },
        ];

        const uniqueCandidates = candidates.filter(
          (v, i, a) =>
            a.findIndex((t) => t.r === v.r && t.c === v.c) === i &&
            v.r >= 0 &&
            v.r < BOARD_SIZE &&
            v.c >= 0 &&
            v.c < BOARD_SIZE,
        );

        for (const cand of uniqueCandidates) {
          if (canPlacePiece(shape, cand.r, cand.c)) {
            const distR = Math.abs(cand.r - floatRow);
            const distC = Math.abs(cand.c - floatCol);
            const score = 1 - (distR * distR + distC * distC);

            if (score > maxScore) {
              maxScore = score;
              bestCandidate = cand;
            }
          }
        }
      }

      if (bestCandidate) {
        const { r, c } = bestCandidate;

        // Calculate Snap Position
        const snapX = c * CELL_SIZE + boardOriginX;
        const snapY = r * CELL_SIZE + boardOriginY;

        const snapTranslateX = snapX - homeX.current;
        const snapTranslateY = snapY - homeY.current;

        // Animate to snap position (Visual feedback before disappearing)
        translateX.value = withTiming(snapTranslateX, { duration: 50 });
        translateY.value = withTiming(snapTranslateY, { duration: 50 });
        scale.value = withTiming(1, { duration: 50 });

        // Execute Drop Logic
        scheduleOnRN(onDrop, id, shape, r, c, color);
        placed = true;
      }
    }

    if (!placed) {
      // Return to home
      translateX.value = withTiming(0, {
        duration: 250,
        easing: Easing.out(Easing.back(1.5)),
      });
      translateY.value = withTiming(0, {
        duration: 250,
        easing: Easing.out(Easing.back(1.5)),
      });
      scale.value = withTiming(fitScale, { duration: 250 });
    }
  };

  const gesture = Gesture.Pan()
    .hitSlop({ vertical: 30, horizontal: 30 })
    .onStart(() => {
      "worklet";
      isDragging.value = true;
      runOnJS(setIsDragging)(true);
      scale.value = withTiming(1, { duration: 200 });
    })
    .onUpdate((e) => {
      "worklet";
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      "worklet";
      isDragging.value = false;
      runOnJS(handleDragEnd)(e.translationX, e.translationY);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value }, // Scale uygula
    ],
    zIndex: isDragging.value ? 1000 : 1,
    opacity: withTiming(isDragging.value ? 0.9 : 1, { duration: 150 }),
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        ref={pieceRef}
        onLayout={handleLayout}
        style={animatedStyle}
      >
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
