# Antigravity Game Architect Skill

**Description**: Karmaşık oyun motoru güncellemelerini ve performans optimizasyonlarını yönetme yeteneği.

## Capabilities

1. **Logic Implementation**: `src/utils/gameLogic.ts` içindeki silme ve puanlama algoritmalarını `Rules` setine göre hatasız günceller.
2. **Haptic Service**: `expo-haptics` kullanarak her "snap", "clear" ve "gameover" durumunda doğru titreşim geri bildirimlerini entegre eder.
3. **Persistence Master**: `AsyncStorage` kullanarak `bestScore` ve `gameState` verilerini kalıcı olarak saklar.
4. **Animation Tuning**: Reanimated easing fonksiyonlarını (Easing.out(Easing.quad)) kullanarak "yaylanmayan" ama akıcı dönüş animasyonları kurar.
