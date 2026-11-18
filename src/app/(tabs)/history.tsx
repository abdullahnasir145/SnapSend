import { Text } from "react-native";

import { ScreenContainer } from "@/components/layout/ScreenContainer";

export default function HistoryScreen() {
  return (
    <ScreenContainer className="items-center justify-center">
      <Text className="text-xl font-bold text-primary">Expense History</Text>
    </ScreenContainer>
  );
}
