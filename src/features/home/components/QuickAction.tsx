import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { Paragraph } from "@/components/ui/typography";

export interface QuickActionProps {
  accessibilityHint: string;
  accessibilityLabel: string;
  icon: ReactNode;
  label: string;
  onPress: () => void;
}

/** Renders a compact navigation action for common money-management tasks. */
export function QuickAction({
  accessibilityHint,
  accessibilityLabel,
  icon,
  label,
  onPress,
}: QuickActionProps) {
  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      className="w-[47%] items-center gap-2 rounded-input bg-surface p-3 active:bg-surface-secondary"
      onPress={onPress}
    >
      <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-soft">
        {icon}
      </View>
      <Paragraph className="text-center" size="sm" weight="medium">
        {label}
      </Paragraph>
    </Pressable>
  );
}
