import { useFonts } from "@expo-google-fonts/poppins";
import { Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { PortalHost } from "@rn-primitives/portal";
import { useColorScheme } from "react-native";

import { poppinsFonts } from "@/constants/fonts";
import { NAV_THEME } from "@/lib/theme";

import "../../global.css";

// Keep the launch screen visible until every Poppins weight used by typography is ready.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts(poppinsFonts);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={NAV_THEME[colorScheme === "dark" ? "dark" : "light"]}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
      <PortalHost />
    </ThemeProvider>
  );
}
