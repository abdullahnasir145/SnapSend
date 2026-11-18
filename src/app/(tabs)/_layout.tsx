import { Tabs } from "expo-router";
import {
  ChartNoAxesColumn,
  History,
  House,
  ScanLine,
  Settings,
} from "lucide-react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const colors = {
  primary: "#087F5B",
  muted: "#89968E",
  border: "#E1E9E4",
  surface: "#FFFFFF",
};

export default function AppTabs() {
  const insets = useSafeAreaInsets();
  // Keep tab controls above the Android navigation bar and iPhone home indicator.
  const tabBarBottomPadding = 8 + insets.bottom;
  // Reserve vertical clearance for the Scan icon while keeping all labels on one baseline.
  const tabBarHeight = 80 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontFamily: "Poppins_500Medium",
          fontSize: 11,
          lineHeight: 14,
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          elevation: 8,
          overflow: "hidden",
          shadowColor: "#172B24",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          height: tabBarHeight,
          paddingTop: 10,
          paddingBottom: tabBarBottomPadding,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <House size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <History size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarIcon: () => (
            <View className="h-9 w-9 items-center justify-center rounded-full bg-primary shadow-sm shadow-primary/30">
              <ScanLine size={19} color="#FFFFFF" />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="budget"
        options={{
          title: "Budget",
          tabBarIcon: ({ color, size }) => (
            <ChartNoAxesColumn size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
