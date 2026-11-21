import { router } from "expo-router";
import {
  ChartNoAxesColumn,
  ChevronRight,
  Keyboard,
  Mic,
  ReceiptText,
} from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";

import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Heading1, Heading3, Paragraph } from "@/components/ui/typography";
import { useFinance } from "@/features/finance/FinanceProvider";
import { formatCurrency, getBudgetSnapshot, getExpenseDateLabel } from "@/features/finance/utils";
import { HomeSummaryCard } from "@/features/home/components/HomeSummaryCard";
import { QuickAction } from "@/features/home/components/QuickAction";
import { TransactionRow } from "@/features/home/components/TransactionRow";
import type { HomeTransaction } from "@/features/home/types";

/** Composes the current spending overview and primary financial actions. */
export function HomeContainer() {
  const { budgets, currency, expenses, isLoading } = useFinance();
  const primaryBudget = budgets.find((budget) => budget.isPrimary && !budget.isArchived) ?? budgets.find((budget) => !budget.isArchived);
  const budgetSnapshot = primaryBudget ? getBudgetSnapshot(primaryBudget, expenses) : null;
  const recentTransactions: HomeTransaction[] = expenses
    .slice(0, 3)
    .map((expense) => ({
      amount: formatCurrency(expense.amount, currency),
      category: expense.category,
      dateLabel: getExpenseDateLabel(expense.createdAt),
      isExpense: true,
      merchant: expense.merchant,
    }));

  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-5 pb-8 pt-3"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Paragraph className="text-muted" size="sm" weight="medium">
              Good morning
            </Paragraph>
            <Heading1 size="2xl">Your money, clearly</Heading1>
          </View>
          <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-soft">
            <Paragraph className="text-primary" weight="bold">
              AN
            </Paragraph>
          </View>
        </View>

        <HomeSummaryCard
          budgetAmount={budgetSnapshot ? `${budgetSnapshot.label} · ${formatCurrency(primaryBudget?.amount ?? 0, currency)}` : "Set your budget"}
          progressPercent={budgetSnapshot?.percent ?? 0}
          spentAmount={formatCurrency(budgetSnapshot?.spent ?? 0, currency)}
        />

        <Pressable
          accessibilityLabel="View your spending chart"
          className="rounded-card bg-surface p-5 active:opacity-75"
          onPress={() => router.navigate({ pathname: "/insights" } as never)}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <View className="mb-3 h-10 w-10 items-center justify-center rounded-full bg-primary-soft">
                <ChartNoAxesColumn color="#087F5B" size={20} />
              </View>
              <Heading3>See your spending chart</Heading3>
              <Paragraph className="mt-1 text-muted" size="sm">
                Explore your trends and category habits in one place.
              </Paragraph>
            </View>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary">
              <ChevronRight color="#FFFFFF" size={20} />
            </View>
          </View>
        </Pressable>

        <View>
          <Heading3>Add an expense</Heading3>
          <View className="mt-3 flex-row flex-wrap gap-3">
            <QuickAction
              accessibilityHint="Opens manual expense entry"
              accessibilityLabel="Add an expense manually"
              icon={<Keyboard color="#087F5B" size={21} />}
              label="Manual"
              onPress={() =>
                router.navigate({ pathname: "/manual-expense" } as never)
              }
            />
            <QuickAction
              accessibilityHint="Opens the receipt scanner"
              accessibilityLabel="Scan a receipt with AI"
              icon={<ReceiptText color="#087F5B" size={21} />}
              label="AI scan"
              onPress={() => router.navigate("/(tabs)/scan")}
            />
            <QuickAction
              accessibilityHint="Opens voice expense entry"
              accessibilityLabel="Add an expense with your voice"
              icon={<Mic color="#087F5B" size={21} />}
              label="Voice"
              onPress={() =>
                router.navigate({ pathname: "/voice-expense" } as never)
              }
            />
          </View>
        </View>

        <View>
          <View className="flex-row items-center justify-between">
            <Heading3>Recent activity</Heading3>
            <Pressable
              accessibilityLabel="View all transactions"
              className="active:opacity-60"
              onPress={() => router.navigate("/(tabs)/history")}
            >
              <Paragraph className="text-primary" size="sm" weight="semibold">
                See all
              </Paragraph>
            </Pressable>
          </View>
          <View className="mt-2 divide-y divide-border rounded-card bg-surface px-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <TransactionRow
                  key={`${transaction.merchant}-${transaction.dateLabel}`}
                  transaction={transaction}
                />
              ))
            ) : (
              <View className="py-6">
                <Paragraph className="text-muted" size="sm">
                  {isLoading
                    ? "Loading your private overview…"
                    : "No expenses yet. Add one manually or scan a receipt."}
                </Paragraph>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
