import { View } from "react-native";
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from "react-native-svg";

import { Paragraph } from "@/components/ui/typography";
import type { InsightBar } from "@/features/insights/types";

export interface SpendingBarChartProps {
  bars: InsightBar[];
  highlightedIndex?: number;
  onSelectBar: (index: number) => void;
}

/** Renders a compact, touchable spending trend without adding a heavyweight chart dependency. */
export function SpendingBarChart({ bars, highlightedIndex, onSelectBar }: SpendingBarChartProps) {
  const maximumAmount = Math.max(...bars.map((bar) => bar.amount), 1);
  const chartWidth = 320;
  const chartHeight = 174;
  const left = 16;
  const right = 304;
  const top = 20;
  const baseline = 132;
  const points = bars.map((bar, index) => ({
    amount: bar.amount,
    index,
    x: left + ((right - left) * index) / Math.max(bars.length - 1, 1),
    y: baseline - ((bar.amount / maximumAmount) * (baseline - top)),
  }));
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L ${right} ${baseline} L ${left} ${baseline} Z`;

  return (
    <View accessibilityLabel="Spending bar chart" accessibilityRole="image">
      <Svg height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%">
        <Defs><LinearGradient id="spendingArea" x1="0" x2="0" y1="0" y2="1"><Stop offset="0" stopColor="#087F5B" stopOpacity={0.22} /><Stop offset="1" stopColor="#087F5B" stopOpacity={0.01} /></LinearGradient></Defs>
        {[top + 20, 76, baseline].map((position) => <Line key={position} stroke="#E1E9E4" strokeDasharray={position === baseline ? undefined : "3 5"} strokeWidth={1} x1={left} x2={right} y1={position} y2={position} />)}
        <Path d={areaPath} fill="url(#spendingArea)" />
        <Path d={linePath} fill="none" stroke="#087F5B" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} />
        {points.map((point) => {
          const isHighlighted = highlightedIndex === point.index;
          return <Circle key={`${bars[point.index].label}-${point.index}`} cx={point.x} cy={point.y} fill={isHighlighted ? "#087F5B" : "#FFFFFF"} r={isHighlighted ? 6 : 4} stroke="#087F5B" strokeWidth={isHighlighted ? 3 : 2} onPress={() => onSelectBar(point.index)} />;
        })}
      </Svg>
      <View className="-mt-7 flex-row justify-between px-1">
        {bars.map((bar, index) => <Paragraph key={`${bar.label}-${index}`} className={highlightedIndex === index ? "text-primary" : "text-muted"} size="sm" weight={highlightedIndex === index ? "semibold" : "normal"}>{bar.label}</Paragraph>)}
      </View>
    </View>
  );
}
