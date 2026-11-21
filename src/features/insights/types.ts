import type { Expense } from "@/features/finance/types";

export type InsightRange = "week" | "month" | "quarter";

export interface InsightBar {
  amount: number;
  label: string;
}

export interface CategoryInsight {
  amount: number;
  name: string;
  percentage: number;
}

export interface InsightsSnapshot {
  averageDailySpend: number;
  bars: InsightBar[];
  categoryBreakdown: CategoryInsight[];
  filteredExpenses: Expense[];
  totalSpent: number;
  transactionCount: number;
}
