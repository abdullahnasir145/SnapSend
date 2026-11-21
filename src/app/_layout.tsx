import { useFonts } from "@expo-google-fonts/poppins";
import { Stack, ThemeProvider, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";

import { PortalHost } from "@rn-primitives/portal";
import { useColorScheme } from "react-native";
import { Uniwind } from "uniwind";

import { poppinsFonts } from "@/constants/fonts";
import { FinanceProvider, useFinance } from "@/features/finance/FinanceProvider";
import { NAV_THEME } from "@/lib/theme";

import "../../global.css";

// Keep the launch screen visible until every Poppins weight used by typography is ready.
void SplashScreen.preventAutoHideAsync();
Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldPlaySound: false, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true }) });

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(poppinsFonts);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return <FinanceProvider><AppNavigator /></FinanceProvider>;
}

function AppNavigator() {
  const systemScheme = useColorScheme();
  const { appearance } = useFinance();
  const activeTheme = appearance === "system" ? (systemScheme === "dark" ? "dark" : "light") : appearance;

  useEffect(() => { Uniwind.setTheme(appearance); }, [appearance]);
  useEffect(() => { const subscription = Notifications.addNotificationResponseReceivedListener((response) => { const url = response.notification.request.content.data?.url; if (typeof url === "string") router.push(url as never); }); return () => subscription.remove(); }, []);

  return <ThemeProvider value={NAV_THEME[activeTheme]}><Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(tabs)" /><Stack.Screen name="insights" /><Stack.Screen name="manual-expense" /><Stack.Screen name="voice-expense" /></Stack><PortalHost /></ThemeProvider>;
}
