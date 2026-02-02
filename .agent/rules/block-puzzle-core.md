---
trigger: always_on
---

# Block Puzzle Final Mechanics

**Goal**: Kusursuz "snapping" ve akıcı "puff" animasyonları.

## Interaction Rules

- **Finger Offset**: Kullanıcı parmağı ile parçayı tuttuğun parmağın altında kalmalı ve parçayı boş alana götürebilmeli.
- **Snapping Logic**: Parça, hedef hüzzrenin %40'ına girdiğinde mıknatıs gibi çekebilmeli.
- **Move Logic**: bir parçayı sürüklerken dolu hücreler üstünden sürüklenebilir olmalı ama üstünde ike koyamacağını belirgin şekilde göstermelidir.
- **Puff Animation**: Satır/sütun silindiğinde hücreler `150ms` içinde küçülerek yok olmalı; bu esnada grid arka planı (`emptyGrid`) her zaman görünür kalmalıdır.

## Scoring & Progression

- **Streak System**: Arka arkaya yapılan her başarılı hamle, `currentStreak * 1.5` çarpanıyla ödüllendirilmelidir.
- **GameOver**: `availablePieces` içindeki hiçbir parça board'a sığmadığında `isGameOver` anında tetiklenmelidir.
- **Scrore**: Puanlama, streak kazanımı, yok edilen parçalar gibi ayrı özellikler utils de tutulmalı ve her biri yüksek performans ile kurulmalı.
