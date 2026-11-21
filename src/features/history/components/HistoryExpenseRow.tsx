import { ArrowUpRight } from "lucide-react-native";
import { View } from "react-native";

import { Paragraph } from "@/components/ui/typography";
import type { Expense } from "@/features/finance/types";
import type { CurrencyCode } from "@/features/finance/types";
import { formatCurrency, getExpenseDateLabel } from "@/features/finance/utils";

export interface HistoryExpenseRowProps {
  currency: CurrencyCode;
  expense: Expense;
}

/** Displays one stored expense with the metadata used for audit-friendly history. */
export function HistoryExpenseRow({ currency, expense }: HistoryExpenseRowProps) {
  return (
    <View className="flex-row items-center border-b border-border py-4 last:border-b-0">
      <View className="h-11 w-11 items-center justify-center rounded-full bg-expense/10"><ArrowUpRight color="#E05252" size={19} /></View>
      <View className="ml-3 flex-1"><Paragraph weight="medium">{expense.merchant}</Paragraph><Paragraph className="mt-0.5 text-muted" size="sm">{expense.category} · {getExpenseDateLabel(expense.createdAt)}</Paragraph></View>
      <Paragraph className="text-expense" weight="semibold">− {formatCurrency(expense.amount, currency)}</Paragraph>
    </View>
  );
}
