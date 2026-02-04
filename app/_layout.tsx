import { CustomSplashScreen } from "@/src/components/Splash/CustomSplashScreen";
import { THEME } from "@/src/utils/constants";
import { Stack } from "expo-router";
import { useState } from "react";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const [isSplashFinished, setSplashFinished] = useState(false);

  if (!isSplashFinished) {
    return <CustomSplashScreen onFinish={() => setSplashFinished(true)} />;
  }

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: THEME.BACKGROUND }}
    >
      <StatusBar barStyle="light-content" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: THEME.BACKGROUND },
          animation: "fade", // Optional: Fades usually look better than slides for this type of game
        }}
      />
    </GestureHandlerRootView>
  );
}
