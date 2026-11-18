import { View } from "react-native";

import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Heading1, Heading2, Paragraph } from "@/components/ui/typography";

export function HomeContainer() {
  return (
    <ScreenContainer className="p-5">
      <Heading1 size="2xl">SnapSpend</Heading1>

      <View className="mt-4 rounded-card bg-surface p-5">
        <Paragraph className="text-muted">Monthly spending</Paragraph>
        <Heading2 className="text-primary">Rs. 24,500</Heading2>
      </View>
    </ScreenContainer>
  );
}
