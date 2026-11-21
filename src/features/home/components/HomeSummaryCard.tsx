import { View } from "react-native";

import { Heading2, Paragraph } from "@/components/ui/typography";

export interface HomeSummaryCardProps {
  budgetAmount: string;
  progressPercent: number;
  spentAmount: string;
}

/** Displays the current monthly spend and the remaining budget context. */
export function HomeSummaryCard({
  budgetAmount,
  progressPercent,
  spentAmount,
}: HomeSummaryCardProps) {
  const clampedProgressPercent = Math.min(Math.max(progressPercent, 0), 100);

  return (
    <View className="overflow-hidden rounded-card bg-primary p-5 shadow-sm shadow-primary/25">
      <Paragraph
        className="text-primary-foreground/75"
        size="sm"
        weight="medium"
      >
        Spent this month
      </Paragraph>
      <Heading2
        className="mt-1 text-primary-foreground"
        size="3xl"
        weight="bold"
      >
        {spentAmount}
      </Heading2>
      <View className="mt-5 h-2 overflow-hidden rounded-full bg-white/25">
        <View
          className="h-full rounded-full bg-white"
          style={{ width: `${clampedProgressPercent}%` }}
        />
      </View>
      <View className="mt-3 flex-row items-center justify-between">
        <Paragraph className="text-primary-foreground/75" size="sm">
          {clampedProgressPercent.toFixed(1)}% of budget used
        </Paragraph>
        <Paragraph
          className="text-primary-foreground"
          size="sm"
          weight="semibold"
        >
          {budgetAmount}
        </Paragraph>
      </View>
    </View>
  );
}
