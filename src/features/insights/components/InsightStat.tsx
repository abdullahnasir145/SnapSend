import { View } from "react-native";

import { Paragraph } from "@/components/ui/typography";

export interface InsightStatProps {
  label: string;
  value: string;
}

/** Shows a compact readout below the spending chart. */
export function InsightStat({ label, value }: InsightStatProps) {
  return <View className="flex-1 rounded-button bg-surface-secondary p-3"><Paragraph className="text-muted" size="sm">{label}</Paragraph><Paragraph className="mt-1" size="lg" weight="semibold">{value}</Paragraph></View>;
}
