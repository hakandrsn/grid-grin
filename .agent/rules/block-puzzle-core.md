---
trigger: always_on
---

# Block Puzzle Final Mechanics

**Goal**: Kusursuz "snapping" ve akıcı "puff" animasyonları.

## Interaction Rules

- **Finger Offset**: Kullanıcı parmağı parçayı kapatmamalı; `PREVIEW_OFFSET_Y` her zaman parmağın en az 220px yukarısında hesaplanmalıdır.
- **Snapping Logic**: Parça, hedef hücrenin %40'lık alanına girdiğinde mıknatıs etkisiyle (preview) oraya çekilmelidir.
- **Puff Animation**: Satır/sütun silindiğinde hücreler `150ms` içinde küçülerek yok olmalı; bu esnada grid arka planı (`emptyGrid`) her zaman görünür kalmalıdır.

## Scoring & Progression

- **Streak System**: Arka arkaya yapılan her başarılı hamle, `currentStreak * 1.5` çarpanıyla ödüllendirilmelidir.
- **GameOver**: `availablePieces` içindeki hiçbir parça board'a sığmadığında `isGameOver` anında tetiklenmelidir.
