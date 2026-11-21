export type BudgetPeriod = "day" | "week" | "month" | "year" | "custom";
export type BudgetScope = "all" | "category";
export type BillFrequency = "week" | "month" | "year";

export interface Budget { id: string; amount: number; scope: BudgetScope; category: string | null; period: BudgetPeriod; startDate: string | null; endDate: string | null; isPrimary: boolean; isArchived: boolean; createdAt: string; updatedAt: string; }
export interface BudgetInput { amount: number; scope: BudgetScope; category: string | null; period: BudgetPeriod; startDate: string | null; endDate: string | null; }
export interface RecurringBill { id: string; name: string; amount: number | null; nextDueDate: string; frequency: BillFrequency; reminderDaysBefore: number; enabled: boolean; notificationId: string | null; createdAt: string; updatedAt: string; }
export interface RecurringBillInput { name: string; amount: number | null; nextDueDate: string; frequency: BillFrequency; reminderDaysBefore: number; enabled: boolean; }
export interface NotificationPreferences { dailyReminderEnabled: boolean; weeklySummaryEnabled: boolean; budgetAlertsEnabled: boolean; dailyReminderHour: number; weeklySummaryHour: number; }

export interface ExpenseCategory {
  id: string;
  name: string;
}

export type AppearancePreference = "system" | "light" | "dark";
export type CurrencyCode = string;

export interface AppPreferences {
  appearance: AppearancePreference;
  currency: CurrencyCode;
}

export interface Expense {
  amount: number;
  category: string;
  createdAt: string;
  id: string;
  merchant: string;
}

export interface CreateExpenseInput {
  amount: number;
  category: string;
  merchant: string;
}

export interface FinanceData {
  preferences: AppPreferences;
  budgets: Budget[];
  categories: ExpenseCategory[];
  expenses: Expense[];
  bills: RecurringBill[];
  notificationPreferences: NotificationPreferences;
}
