import { ReceiptText, SlidersHorizontal } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Heading1, Heading2, Paragraph } from "@/components/ui/typography";
import { useFinance } from "@/features/finance/FinanceProvider";
import { formatCurrency } from "@/features/finance/utils";
import { HistoryExpenseRow } from "@/features/history/components/HistoryExpenseRow";

const allCategoriesLabel = "All";

/** Coordinates browsing and lightweight filtering of locally stored expenses. */
export function HistoryContainer() {
  const { currency, expenses, isLoading } = useFinance();
  const [selectedCategory, setSelectedCategory] = useState(allCategoriesLabel);
  const categories = useMemo(() => [allCategoriesLabel, ...Array.from(new Set(expenses.map((expense) => expense.category))).sort()], [expenses]);
  const visibleExpenses = selectedCategory === allCategoriesLabel ? expenses : expenses.filter((expense) => expense.category === selectedCategory);
  const totalAmount = visibleExpenses.reduce((total, expense) => total + expense.amount, 0);

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" contentContainerClassName="pb-8 pt-3" showsVerticalScrollIndicator={false}>
        <View className="px-5"><Paragraph className="text-muted" size="sm" weight="medium">Everything you have recorded</Paragraph><Heading1 size="2xl">Expense history</Heading1></View>

        <View className="mx-5 mt-6 rounded-card bg-primary p-5 shadow-sm shadow-primary/25">
          <View className="flex-row items-center justify-between"><View><Paragraph className="text-primary-foreground/75" size="sm" weight="medium">{selectedCategory === allCategoriesLabel ? "Total recorded" : `${selectedCategory} total`}</Paragraph><Heading2 className="mt-1 text-primary-foreground" size="3xl" weight="bold">{formatCurrency(totalAmount, currency)}</Heading2></View><View className="h-12 w-12 items-center justify-center rounded-full bg-white/15"><ReceiptText color="#FFFFFF" size={23} /></View></View>
          <Paragraph className="mt-3 text-primary-foreground/75" size="sm">{visibleExpenses.length} {visibleExpenses.length === 1 ? "expense" : "expenses"} in this view</Paragraph>
        </View>

        <View className="mt-6"><View className="flex-row items-center gap-2 px-5"><SlidersHorizontal color="#087F5B" size={18} /><Paragraph weight="semibold">Filter by category</Paragraph></View><ScrollView className="mt-3" contentContainerClassName="gap-2 px-5" horizontal showsHorizontalScrollIndicator={false}>{categories.map((category) => { const isSelected = category === selectedCategory; return <Pressable accessibilityLabel={`Show ${category} expenses`} className={isSelected ? "rounded-full bg-primary px-4 py-2 active:opacity-85" : "rounded-full bg-surface-secondary px-4 py-2 active:opacity-70"} key={category} onPress={() => setSelectedCategory(category)}><Paragraph className={isSelected ? "text-primary-foreground" : "text-muted"} size="sm" weight="medium">{category}</Paragraph></Pressable>; })}</ScrollView></View>

        <View className="mx-5 mt-6 rounded-card bg-surface px-4"><Paragraph className="border-b border-border py-4 text-muted" size="sm" weight="medium">LATEST EXPENSES</Paragraph>{isLoading ? <Paragraph className="py-6 text-muted" size="sm">Loading your local history…</Paragraph> : visibleExpenses.length > 0 ? visibleExpenses.map((expense) => <HistoryExpenseRow currency={currency} expense={expense} key={expense.id} />) : <View className="items-center py-8"><View className="h-12 w-12 items-center justify-center rounded-full bg-primary-soft"><ReceiptText color="#087F5B" size={22} /></View><Paragraph className="mt-3" weight="semibold">No expenses here yet</Paragraph><Paragraph className="mt-1 text-center text-muted" size="sm">Add one from Home or capture a receipt to start your history.</Paragraph></View>}</View>
      </ScrollView>
    </ScreenContainer>
  );
}
