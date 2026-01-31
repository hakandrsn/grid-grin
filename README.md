# Grid Grin
## Grid Grin, klasik blok bulmaca mekaniklerini modern bir dokunuşla (ve bolca emojiyle 😄) yeniden yorumladığım bir mobil oyun projesi.

Bu projeyi sadece bir oyun yapmak için değil, React Native'in sınırlarını zorlamak, yüksek performanslı animasyonlar ve karmaşık oyun mantıkları (state management) üzerine deneyler yapmak için geliştirdim.

### Neden Bu Proje?
Marketlerdeki binlerce bulmaca oyunundan farklı olarak, teknik tarafta "native" performansı yakalayan, kullanıcı deneyimi (UX) tarafında ise akıcı ve "canlı" hissettiren bir yapı kurmayı hedefledim.

Şu anki versiyonda odaklandığım temel özellikler:

Dinamik Grid Yapısı: 10x10'luk (veya değişken) grid üzerinde emojilerin (blokların) yerleşimi.

Strike Mekaniği: Oyuncuyu ödüllendiren ve oyun zevkini artıran özel kombolar.

Performans: react-native-reanimated kullanarak 60 FPS (hatta 120 FPS) animasyonlar.

### Teknolojiler & Mimari
Bir Full-Stack Developer olarak, bu projede mobil taraftaki kaslarımı şu teknolojilerle güçlendirdim:

Framework: React Native (Expo Managed Workflow)

Dil: TypeScript (Tip güvenliği ve sürdürülebilirlik için vazgeçilmezim)

Grafik & Animasyon: react-native-reanimated

State Management: Zustand

Mimari: Modüler ve test edilebilir bir yapı (bkz: services/ ve src/ klasörleri)

### Öğrendiklerim & Zorluklar
Bu süreçte "çalışan kod" ile "performanslı kod" arasındaki farkı net bir şekilde gördüm. Özellikle:

Skia ile canvas üzerinde çizim yaparken bellek yönetimi. daha sonra tamamen 60 FPS için reanimated

Android emülatörlerinde (ve fiziksel cihazlarda) animasyonların senkronizasyonu.

Karmaşık oyun döngülerinin (Game Loop) React'in render mantığıyla çakışmadan yönetilmesi gibi konularda ciddi tecrübeler edindim.

### Kurulum (Local Development)
Projeyi kendi bilgisayarında denemek istersen:

Repoyu klonla:

Bash
`git clone https://github.com/hakandrsn/grid-grin.git`
`cd grid-grin`
Bağımlılıkları yükle:

Bash
`npm install`
Uygulamayı başlat:

Bash
`npx expo start`
(Android Studio emülatörü veya fiziksel cihazında Expo Go ile taratabilirsin.)

LinkedIn Profilim | Diğer Projelerim

Not: Bu proje aktif geliştirme aşamasındadır (WIP). Kodları incelerken issues.md dosyasına göz atarak gelecek planlarımı ve bilinen hataları görebilirsiniz.
