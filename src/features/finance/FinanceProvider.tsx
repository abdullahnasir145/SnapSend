import {
  archiveBudget,
  createExpense,
  createExpenseCategory,
  deleteBill,
  deleteBudget,
  getFinanceData,
  saveBill,
  saveBudget,
  saveNotificationPreferences,
  savePreference,
  setPrimaryBudget,
} from "@/features/finance/services/financeRepository";
import { syncLocalReminders } from "@/features/finance/services/notificationService";
import type {
  AppearancePreference,
  Budget,
  BudgetInput,
  CreateExpenseInput,
  CurrencyCode,
  Expense,
  ExpenseCategory,
  NotificationPreferences,
  RecurringBill,
  RecurringBillInput,
} from "@/features/finance/types";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface FinanceContextValue {
  budgets: Budget[];
  categories: ExpenseCategory[];
  appearance: AppearancePreference;
  currency: CurrencyCode;
  expenses: Expense[];
  bills: RecurringBill[];
  notificationPreferences: NotificationPreferences;
  isLoading: boolean;
  addExpense(input: CreateExpenseInput): Promise<void>;
  addCategory(name: string): Promise<ExpenseCategory>;
  saveBudget(input: BudgetInput, id?: string): Promise<void>;
  setPrimaryBudget(id: string): Promise<void>;
  archiveBudget(id: string): Promise<void>;
  deleteBudget(id: string): Promise<void>;
  saveBill(input: RecurringBillInput, id?: string): Promise<void>;
  deleteBill(id: string): Promise<void>;
  setNotificationPreferences(
    preferences: NotificationPreferences,
  ): Promise<void>;
  setAppearance(appearance: AppearancePreference): Promise<void>;
  setCurrency(currency: CurrencyCode): Promise<void>;
}
export interface FinanceProviderProps {
  children: ReactNode;
}
const FinanceContext = createContext<FinanceContextValue | undefined>(
  undefined,
);
export function FinanceProvider({ children }: FinanceProviderProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [appearance, setAppearanceState] =
    useState<AppearancePreference>("system");
  const [currency, setCurrencyState] = useState<CurrencyCode>("PKR");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [bills, setBills] = useState<RecurringBill[]>([]);
  const [notificationPreferences, setNotificationPreferencesState] =
    useState<NotificationPreferences>({
      dailyReminderEnabled: false,
      weeklySummaryEnabled: false,
      budgetAlertsEnabled: false,
      dailyReminderHour: 20,
      weeklySummaryHour: 19,
    });
  const [isLoading, setIsLoading] = useState(true);
  const reload = useCallback(async () => {
    const data = await getFinanceData();
    setBudgets(data.budgets);
    setCategories(data.categories);
    setAppearanceState(data.preferences.appearance);
    setCurrencyState(data.preferences.currency);
    setExpenses(data.expenses);
    setBills(data.bills);
    setNotificationPreferencesState(data.notificationPreferences);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      void reload().finally(() => setIsLoading(false));
    }, 0);
    return () => clearTimeout(timer);
  }, [reload]);
  const addExpense = useCallback(async (input: CreateExpenseInput) => {
    const expense = await createExpense(input);
    setExpenses((current) => [expense, ...current]);
  }, []);
  const addCategory = useCallback(async (name: string) => {
    const category = await createExpenseCategory(name);
    setCategories((current) =>
      current.some((item) => item.id === category.id)
        ? current
        : [...current, category],
    );
    return category;
  }, []);
  const value = useMemo<FinanceContextValue>(
    () => ({
      budgets,
      categories,
      appearance,
      currency,
      expenses,
      bills,
      notificationPreferences,
      isLoading,
      addExpense,
      addCategory,
      saveBudget: async (input, id) => {
        await saveBudget(input, id);
        await reload();
      },
      setPrimaryBudget: async (id) => {
        await setPrimaryBudget(id);
        await reload();
      },
      archiveBudget: async (id) => {
        await archiveBudget(id);
        await reload();
      },
      deleteBudget: async (id) => {
        await deleteBudget(id);
        await reload();
      },
      saveBill: async (input, id) => {
        await saveBill(input, id);
        await reload();
      },
      deleteBill: async (id) => {
        await deleteBill(id);
        await reload();
      },
      setNotificationPreferences: async (preferences) => {
        await saveNotificationPreferences(preferences);
        setNotificationPreferencesState(preferences);
        await syncLocalReminders(preferences);
      },
      setAppearance: async (next) => {
        await savePreference("appearance", next);
        setAppearanceState(next);
      },
      setCurrency: async (next) => {
        await savePreference("currency", next);
        setCurrencyState(next);
      },
    }),
    [
      addCategory,
      addExpense,
      appearance,
      bills,
      budgets,
      categories,
      currency,
      expenses,
      isLoading,
      notificationPreferences,
      reload,
    ],
  );
  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
}
export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context)
    throw new Error("useFinance must be used within FinanceProvider");
  return context;
}
