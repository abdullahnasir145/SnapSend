import { Text } from "react-native";

import { ScreenContainer } from "@/components/layout/ScreenContainer";

export default function ScanScreen() {
  return (
    <ScreenContainer className="items-center justify-center">
      <Text className="text-xl font-bold text-primary">Scan Receipt</Text>
    </ScreenContainer>
  );
}
