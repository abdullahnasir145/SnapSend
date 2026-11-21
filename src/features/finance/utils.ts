import type { Budget, CurrencyCode, Expense } from "@/features/finance/types";

export interface BudgetSnapshot { budget: Budget; spent: number; remaining: number; percent: number; label: string; status: "upcoming" | "active" | "expired"; }

function localDate(value: Date) { return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`; }
function periodBounds(budget: Budget, now: Date) {
  if (budget.period === "custom") return { start: budget.startDate ?? "", end: budget.endDate ?? "" };
  const start = new Date(now); const end = new Date(now);
  if (budget.period === "day") { /* today */ }
  if (budget.period === "week") { const day = (now.getDay() + 6) % 7; start.setDate(now.getDate() - day); end.setDate(start.getDate() + 6); }
  if (budget.period === "month") { start.setDate(1); end.setMonth(now.getMonth() + 1, 0); }
  if (budget.period === "year") { start.setMonth(0, 1); end.setMonth(11, 31); }
  return { start: localDate(start), end: localDate(end) };
}
export function getBudgetSnapshot(budget: Budget, expenses: Expense[], now = new Date()): BudgetSnapshot {
  const { start, end } = periodBounds(budget, now); const today = localDate(now);
  const status = today < start ? "upcoming" : today > end ? "expired" : "active";
  const spent = expenses.filter((expense) => { const day = localDate(new Date(expense.createdAt)); return day >= start && day <= end && (budget.scope === "all" || expense.category === budget.category); }).reduce((sum, expense) => sum + expense.amount, 0);
  const label = `${budget.scope === "all" ? "All spending" : budget.category ?? "Category"} · ${budget.period === "custom" ? `${start} – ${end}` : budget.period[0].toUpperCase() + budget.period.slice(1)}`;
  return { budget, spent, remaining: budget.amount - spent, percent: budget.amount ? (spent / budget.amount) * 100 : 0, label, status };
}

/** Formats monetary values using the user's selected display currency. */
// export function formatCurrency(amount: number, currency: CurrencyCode = "PKR") {
//   return new Intl.NumberFormat(currency === "PKR" ? "en-PK" : "en-US", { currency, currencyDisplay: "narrowSymbol", maximumFractionDigits: 0, style: "currency" }).format(amount);
// }

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = "PKR",
  padDigits?: 2 | 3,
) {
  const formatter = new Intl.NumberFormat(
    currency === "PKR" ? "en-PK" : "en-US",
    {
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 0,
      style: "currency",
      ...(padDigits ? { minimumIntegerDigits: padDigits } : {}),
    },
  );

  if (!padDigits) return formatter.format(amount);

  return formatter
    .formatToParts(amount)
    .map((part) =>
      part.type === "integer"
        ? part.value.padStart(padDigits, "0")
        : part.value,
    )
    .join("");
}

export function getCurrencySymbol(currency: CurrencyCode) {
  return currency === "PKR" ? "Rs." : currency === "USD" ? "$" : "€";
}

/** Converts a valid positive currency field value to a number. */
export function parseAmount(value: string) {
  const normalizedValue = value.replace(/,/g, "").trim();
  const amount = Number(normalizedValue);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

/** Gives recent transactions a compact, locale-aware date label. */
export function getExpenseDateLabel(createdAt: string) {
  const date = new Date(createdAt);
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
  }).format(date);
}
