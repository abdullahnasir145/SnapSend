import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export interface ScreenContainerProps {
  children: ReactNode;
  className?: string;
}

export function ScreenContainer(props: ScreenContainerProps) {
  const { children, className } = props;
  return (
    <View className="flex-1 bg-background">
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View className={`flex-1 ${className ?? ""}`}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
