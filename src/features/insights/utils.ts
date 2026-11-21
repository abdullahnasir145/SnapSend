import type { Expense } from "@/features/finance/types";
import type { CategoryInsight, InsightBar, InsightRange, InsightsSnapshot } from "@/features/insights/types";

const RANGE_DAYS: Record<InsightRange, number> = {
  week: 7,
  month: 30,
  quarter: 90,
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isExpenseInRange(expense: Expense, range: InsightRange, now: Date) {
  const oldestIncludedDate = startOfDay(now);
  oldestIncludedDate.setDate(oldestIncludedDate.getDate() - (RANGE_DAYS[range] - 1));
  const createdAt = new Date(expense.createdAt);
  return !Number.isNaN(createdAt.getTime()) && createdAt >= oldestIncludedDate && createdAt <= now;
}

function formatBarLabel(date: Date, range: InsightRange) {
  return range === "week"
    ? new Intl.DateTimeFormat("en-PK", { weekday: "narrow" }).format(date)
    : new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short" }).format(date);
}

function buildBars(expenses: Expense[], range: InsightRange, now: Date): InsightBar[] {
  const numberOfBars = range === "week" ? 7 : range === "month" ? 6 : 6;
  const daysPerBar = range === "week" ? 1 : range === "month" ? 5 : 15;
  const currentDay = startOfDay(now);

  return Array.from({ length: numberOfBars }, (_, index) => {
    const end = new Date(currentDay);
    end.setDate(end.getDate() - ((numberOfBars - 1 - index) * daysPerBar));
    const start = new Date(end);
    start.setDate(start.getDate() - (daysPerBar - 1));
    const amount = expenses.reduce((total, expense) => {
      const expenseDate = new Date(expense.createdAt);
      return expenseDate >= start && expenseDate < new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1)
        ? total + expense.amount
        : total;
    }, 0);

    return { amount, label: formatBarLabel(end, range) };
  });
}

export function buildInsightsSnapshot(expenses: Expense[], range: InsightRange, category: string | null, now = new Date()): InsightsSnapshot {
  const expensesInRange = expenses.filter((expense) => isExpenseInRange(expense, range, now));
  const filteredExpenses = category === null ? expensesInRange : expensesInRange.filter((expense) => expense.category === category);
  const totalSpent = filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  const categoryTotals = filteredExpenses.reduce<Record<string, number>>((totals, expense) => {
    totals[expense.category] = (totals[expense.category] ?? 0) + expense.amount;
    return totals;
  }, {});
  const categoryBreakdown: CategoryInsight[] = Object.entries(categoryTotals)
    .map(([name, amount]) => ({ amount, name, percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0 }))
    .sort((first, second) => second.amount - first.amount);

  return {
    averageDailySpend: totalSpent / RANGE_DAYS[range],
    bars: buildBars(filteredExpenses, range, now),
    categoryBreakdown,
    filteredExpenses,
    totalSpent,
    transactionCount: filteredExpenses.length,
  };
}
