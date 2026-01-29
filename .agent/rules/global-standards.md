---
trigger: always_on
---

# Antigravity Global Standards

**Goal**: En yüksek FPS ve en düşük teknik borç ile oyun geliştirme.

## Technical Constraints

- **State Management**: Tüm oyun mantığı (Board, Score, GameState) `src/store/useGameStore.ts` içinde merkezi olarak yönetilmelidir.
- **UI Performance**:
  - Board içindeki her `Cell` mutlaka `memo` ile sarmalanmalıdır.
  - Animasyonlar sadece `react-native-reanimated` (v4+) üzerinden `useSharedValue` ve `useAnimatedStyle` ile yapılmalıdır.
- **Coordinate Integrity**: Sürükle-bırak işlemlerinde `measureInWindow` kullanılarak mutlak koordinat senkronizasyonu her zaman korunmalıdır.
