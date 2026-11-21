import { ArrowDownLeft, ArrowUpRight } from "lucide-react-native";
import { View } from "react-native";

import { Paragraph } from "@/components/ui/typography";

import type { HomeTransaction } from "@/features/home/types";

export interface TransactionRowProps {
  transaction: HomeTransaction;
}

/** Shows one recent transaction with its category, date, and directional amount. */
export function TransactionRow({ transaction }: TransactionRowProps) {
  const amountClassName = transaction.isExpense ? "text-expense" : "text-income";
  const AmountIcon = transaction.isExpense ? ArrowUpRight : ArrowDownLeft;
  const amountPrefix = transaction.isExpense ? "−" : "+";

  return (
    <View className="flex-row items-center py-3">
      <View className="h-11 w-11 items-center justify-center rounded-full bg-surface-secondary">
        <AmountIcon color={transaction.isExpense ? "#E05252" : "#159F72"} size={19} />
      </View>
      <View className="ml-3 flex-1">
        <Paragraph weight="medium">{transaction.merchant}</Paragraph>
        <Paragraph className="mt-0.5 text-muted" size="sm">
          {transaction.category} · {transaction.dateLabel}
        </Paragraph>
      </View>
      <Paragraph className={amountClassName} weight="semibold">
        {amountPrefix} {transaction.amount}
      </Paragraph>
    </View>
  );
}
