import { router } from "expo-router";
import { ArrowLeft, ChevronRight, SlidersHorizontal } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import { useMemo, useState } from "react";

import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Heading1, Heading2, Heading3, Paragraph } from "@/components/ui/typography";
import { InsightStat } from "@/features/insights/components/InsightStat";
import { SpendingBarChart } from "@/features/insights/components/SpendingBarChart";
import type { InsightRange } from "@/features/insights/types";
import { buildInsightsSnapshot } from "@/features/insights/utils";
import { useFinance } from "@/features/finance/FinanceProvider";
import { formatCurrency } from "@/features/finance/utils";

const RANGE_OPTIONS: { label: string; value: InsightRange }[] = [
  { label: "7 days", value: "week" },
  { label: "30 days", value: "month" },
  { label: "3 months", value: "quarter" },
];

/** Provides an interactive spending analysis view scoped to locally stored expenses. */
export function InsightsContainer() {
  const { categories, currency, expenses } = useFinance();
  const [range, setRange] = useState<InsightRange>("week");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | undefined>();
  const snapshot = useMemo(() => buildInsightsSnapshot(expenses, range, selectedCategory), [expenses, range, selectedCategory]);
  const filterCategories = Array.from(new Set([...categories.map((category) => category.name), ...expenses.map((expense) => expense.category)])).sort();
  const selectedBar = selectedBarIndex === undefined ? null : snapshot.bars[selectedBarIndex];

  return <ScreenContainer><ScrollView className="flex-1" contentContainerClassName="gap-6 px-5 pb-10 pt-3" showsVerticalScrollIndicator={false}>
    <View className="flex-row items-center justify-between"><Pressable accessibilityLabel="Go back" className="h-11 w-11 items-center justify-center rounded-full bg-surface" onPress={() => router.back()}><ArrowLeft color="#087F5B" size={21} /></Pressable><Heading2 size="xl">Spending insights</Heading2><View className="h-11 w-11 items-center justify-center rounded-full bg-primary-soft"><SlidersHorizontal color="#087F5B" size={20} /></View></View>

    <View><Heading1 size="2xl">Understand your spending</Heading1><Paragraph className="mt-1 text-muted" size="sm">Track trends, spot habits, and stay in control.</Paragraph></View>

    <View className="flex-row rounded-button bg-surface-secondary p-1">{RANGE_OPTIONS.map((option) => <Pressable key={option.value} accessibilityRole="button" className={`flex-1 rounded-input px-2 py-2 ${range === option.value ? "bg-surface shadow-sm" : ""}`} onPress={() => { setRange(option.value); setSelectedBarIndex(undefined); }}><Paragraph className={`text-center ${range === option.value ? "text-primary" : "text-muted"}`} size="sm" weight="semibold">{option.label}</Paragraph></Pressable>)}</View>

    <View className="rounded-card bg-surface p-5"><View className="flex-row items-start justify-between"><View><Paragraph className="text-muted" size="sm">Total spending</Paragraph><Heading2 className="mt-1" size="3xl">{formatCurrency(snapshot.totalSpent, currency)}</Heading2></View><View className="rounded-full bg-primary-soft px-3 py-1"><Paragraph className="text-primary" size="sm" weight="semibold">{RANGE_OPTIONS.find((item) => item.value === range)?.label}</Paragraph></View></View><View className="mt-4"><SpendingBarChart bars={snapshot.bars} highlightedIndex={selectedBarIndex} onSelectBar={setSelectedBarIndex} /></View>{selectedBar ? <Paragraph className="mt-4 text-center text-muted" size="sm">{selectedBar.label}: {formatCurrency(selectedBar.amount, currency)}</Paragraph> : <Paragraph className="mt-4 text-center text-muted" size="sm">Tap a bar to inspect that period.</Paragraph>}</View>

    <View className="flex-row gap-3"><InsightStat label="Daily average" value={formatCurrency(snapshot.averageDailySpend, currency)} /><InsightStat label="Transactions" value={String(snapshot.transactionCount)} /></View>

    <View><View className="flex-row items-center justify-between"><Heading3>Filter by category</Heading3><Paragraph className="text-muted" size="sm">{selectedCategory ?? "All spending"}</Paragraph></View><ScrollView className="mt-3" contentContainerClassName="gap-2" horizontal showsHorizontalScrollIndicator={false}><Pressable className={`rounded-full px-4 py-2 ${selectedCategory === null ? "bg-primary" : "bg-surface-secondary"}`} onPress={() => setSelectedCategory(null)}><Paragraph className={selectedCategory === null ? "text-primary-foreground" : "text-muted"} size="sm" weight="semibold">All</Paragraph></Pressable>{filterCategories.map((category) => <Pressable key={category} className={`rounded-full px-4 py-2 ${selectedCategory === category ? "bg-primary" : "bg-surface-secondary"}`} onPress={() => { setSelectedCategory(category); setSelectedBarIndex(undefined); }}><Paragraph className={selectedCategory === category ? "text-primary-foreground" : "text-muted"} size="sm" weight="semibold">{category}</Paragraph></Pressable>)}</ScrollView></View>

    <View><View className="flex-row items-center justify-between"><Heading3>Top categories</Heading3><Paragraph className="text-muted" size="sm">{RANGE_OPTIONS.find((item) => item.value === range)?.label}</Paragraph></View><View className="mt-3 overflow-hidden rounded-card bg-surface">{snapshot.categoryBreakdown.length > 0 ? snapshot.categoryBreakdown.slice(0, 4).map((category, index) => <View key={category.name} className={`flex-row items-center justify-between px-4 py-4 ${index > 0 ? "border-t border-border" : ""}`}><View className="flex-row items-center gap-3"><View className="h-9 w-9 items-center justify-center rounded-full bg-primary-soft"><Paragraph className="text-primary" size="sm" weight="bold">{category.name.slice(0, 1).toUpperCase()}</Paragraph></View><View><Paragraph weight="semibold">{category.name}</Paragraph><Paragraph className="text-muted" size="sm">{category.percentage}% of selected spend</Paragraph></View></View><View className="flex-row items-center gap-2"><Paragraph weight="semibold">{formatCurrency(category.amount, currency)}</Paragraph><ChevronRight color="#64756D" size={18} /></View></View>) : <View className="px-4 py-7"><Paragraph className="text-muted" size="sm">No expenses match these filters yet.</Paragraph></View>}</View></View>
  </ScrollView></ScreenContainer>;
}
