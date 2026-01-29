---
trigger: always_on
---

Dil ve Stack: Her zaman TypeScript kullanılmalı, mobil arayüzlerde React Native + Expo tercih edilmelidir.

State Yönetimi: Karmaşık UI durumları yerine her zaman Zustand store kullanılmalı, "logic" ve "view" katmanları ayrılmalıdır.

Performans: Animasyonlar için react-native-reanimated kullanılmalı ve gereksiz render'ları önlemek için memo ve useSharedValue optimizasyonları zorunlu tutulmalıdır.
