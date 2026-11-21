import * as SQLite from "expo-sqlite";
import type { AppPreferences, Budget, BudgetInput, CreateExpenseInput, Expense, ExpenseCategory, FinanceData, NotificationPreferences, RecurringBill, RecurringBillInput } from "@/features/finance/types";

const databaseName = "snapsend.db";
const defaultCategoryNames = ["Groceries", "Transport", "Dining", "Bills"];
const defaultNotifications: NotificationPreferences = { dailyReminderEnabled: false, weeklySummaryEnabled: false, budgetAlertsEnabled: false, dailyReminderHour: 20, weeklySummaryHour: 19 };
let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;
const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

async function getDatabase() {
  if (!databasePromise) databasePromise = SQLite.openDatabaseAsync(databaseName);
  const database = await databasePromise;
  const existingBudgetColumns = await database.getAllAsync<{ name: string }>("PRAGMA table_info(budgets)");
  if (existingBudgetColumns.length > 0 && !existingBudgetColumns.some((column) => column.name === "scope")) {
    await database.execAsync("ALTER TABLE budgets RENAME TO legacy_budgets;");
  }
  await database.execAsync(`PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS budgets (id TEXT PRIMARY KEY NOT NULL, amount REAL NOT NULL, scope TEXT NOT NULL, category TEXT, period TEXT NOT NULL, start_date TEXT, end_date TEXT, is_primary INTEGER NOT NULL DEFAULT 0, is_archived INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS expenses (id TEXT PRIMARY KEY NOT NULL, merchant TEXT NOT NULL, category TEXT NOT NULL, amount REAL NOT NULL CHECK (amount > 0), created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS expense_categories (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL COLLATE NOCASE UNIQUE, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS recurring_bills (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, amount REAL, next_due_date TEXT NOT NULL, frequency TEXT NOT NULL, reminder_days_before INTEGER NOT NULL DEFAULT 1, enabled INTEGER NOT NULL DEFAULT 1, notification_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS app_preferences (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS expenses_created_at_index ON expenses(created_at DESC);`);
  const legacyTable = await database.getFirstAsync<{ name: string }>("SELECT name FROM sqlite_master WHERE type='table' AND name='legacy_budgets'");
  if (legacyTable) {
    const legacy = await database.getFirstAsync<{ amount: number; updated_at: string }>("SELECT amount, updated_at FROM legacy_budgets WHERE id = 1");
    if (legacy) await database.runAsync("INSERT OR IGNORE INTO budgets (id, amount, scope, category, period, start_date, end_date, is_primary, is_archived, created_at, updated_at) VALUES (?, ?, 'all', NULL, 'month', NULL, NULL, 1, 0, ?, ?)", "legacy-monthly", legacy.amount, legacy.updated_at, legacy.updated_at);
    await database.execAsync("DROP TABLE legacy_budgets;");
  }
  return database;
}

function toBudget(row: Record<string, unknown>): Budget { return { id: String(row.id), amount: Number(row.amount), scope: row.scope === "category" ? "category" : "all", category: typeof row.category === "string" ? row.category : null, period: row.period as Budget["period"], startDate: typeof row.start_date === "string" ? row.start_date : null, endDate: typeof row.end_date === "string" ? row.end_date : null, isPrimary: Boolean(row.is_primary), isArchived: Boolean(row.is_archived), createdAt: String(row.created_at), updatedAt: String(row.updated_at) }; }
function toBill(row: Record<string, unknown>): RecurringBill { return { id: String(row.id), name: String(row.name), amount: row.amount === null ? null : Number(row.amount), nextDueDate: String(row.next_due_date), frequency: row.frequency as RecurringBill["frequency"], reminderDaysBefore: Number(row.reminder_days_before), enabled: Boolean(row.enabled), notificationId: typeof row.notification_id === "string" ? row.notification_id : null, createdAt: String(row.created_at), updatedAt: String(row.updated_at) }; }

export async function getFinanceData(): Promise<FinanceData> {
  const db = await getDatabase();
  const budgets = (await db.getAllAsync<Record<string, unknown>>("SELECT * FROM budgets ORDER BY is_primary DESC, created_at DESC")).map(toBudget);
  const expenses = await db.getAllAsync<Expense>("SELECT id, merchant, category, amount, created_at as createdAt FROM expenses ORDER BY created_at DESC");
  const rows = await db.getAllAsync<{ id: string; name: string }>("SELECT id, name FROM expense_categories ORDER BY created_at ASC");
  const existing = new Set(rows.map((item) => item.name.toLowerCase())); const categories = [...defaultCategoryNames.filter((name) => !existing.has(name.toLowerCase())).map((name) => ({ id: `default-${name.toLowerCase()}`, name })), ...rows];
  const preferenceRows = await db.getAllAsync<{ key: string; value: string }>("SELECT key, value FROM app_preferences"); const values = new Map(preferenceRows.map((row) => [row.key, row.value]));
  const notificationPreferences = { ...defaultNotifications, ...Object.fromEntries(Object.entries(defaultNotifications).map(([key, value]) => [key, values.get(`notification.${key}`) === undefined ? value : values.get(`notification.${key}`) === "true" ? true : values.get(`notification.${key}`) === "false" ? false : Number(values.get(`notification.${key}`))])) } as NotificationPreferences;
  const storedAppearance = values.get("appearance");
  return { budgets, expenses, categories, bills: (await db.getAllAsync<Record<string, unknown>>("SELECT * FROM recurring_bills ORDER BY next_due_date ASC")).map(toBill), preferences: { appearance: storedAppearance === "light" || storedAppearance === "dark" ? storedAppearance : "system", currency: values.get("currency") && /^[A-Z]{3}$/.test(values.get("currency") ?? "") ? values.get("currency") as string : "PKR" }, notificationPreferences };
}
export async function savePreference<Key extends keyof AppPreferences>(key: Key, value: AppPreferences[Key]) { const db = await getDatabase(); await db.runAsync("INSERT INTO app_preferences (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", key, value); }
export async function saveNotificationPreferences(preferences: NotificationPreferences) { const db = await getDatabase(); for (const [key, value] of Object.entries(preferences)) await db.runAsync("INSERT INTO app_preferences (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", `notification.${key}`, String(value)); }
export async function createExpenseCategory(name: string): Promise<ExpenseCategory> { const db = await getDatabase(); const normalized = name.trim().replace(/\s+/g, " "); if (!normalized) throw new Error("Category required"); const found = defaultCategoryNames.find((item) => item.toLowerCase() === normalized.toLowerCase()); if (found) return { id: `default-${found.toLowerCase()}`, name: found }; const current = await db.getFirstAsync<{id:string;name:string}>("SELECT id,name FROM expense_categories WHERE name=? COLLATE NOCASE", normalized); if (current) return current; const category = { id: id("category"), name: normalized }; await db.runAsync("INSERT INTO expense_categories (id,name,created_at) VALUES (?,?,?)", category.id, category.name, new Date().toISOString()); return category; }
export async function createExpense(input: CreateExpenseInput): Promise<Expense> { const db = await getDatabase(); const expense = { ...input, id: id("expense"), createdAt: new Date().toISOString() }; await db.runAsync("INSERT INTO expenses (id,merchant,category,amount,created_at) VALUES (?,?,?,?,?)", expense.id, expense.merchant, expense.category, expense.amount, expense.createdAt); return expense; }
export async function saveBudget(input: BudgetInput, existingId?: string): Promise<Budget> { const db = await getDatabase(); const now = new Date().toISOString(); const budgetId = existingId ?? id("budget"); if (!existingId) { const count = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM budgets WHERE is_archived=0"); if (count?.count === 0) await db.runAsync("UPDATE budgets SET is_primary=0"); }
  await db.runAsync("INSERT INTO budgets (id,amount,scope,category,period,start_date,end_date,is_primary,is_archived,created_at,updated_at) VALUES (?,?,?,?,?,?,?,COALESCE((SELECT is_primary FROM budgets WHERE id=?), CASE WHEN (SELECT COUNT(*) FROM budgets WHERE is_archived=0)=0 THEN 1 ELSE 0 END),COALESCE((SELECT is_archived FROM budgets WHERE id=?),0),COALESCE((SELECT created_at FROM budgets WHERE id=?),?),?) ON CONFLICT(id) DO UPDATE SET amount=excluded.amount,scope=excluded.scope,category=excluded.category,period=excluded.period,start_date=excluded.start_date,end_date=excluded.end_date,updated_at=excluded.updated_at", budgetId, input.amount, input.scope, input.category, input.period, input.startDate, input.endDate, budgetId, budgetId, budgetId, now, now);
  return toBudget((await db.getFirstAsync<Record<string, unknown>>("SELECT * FROM budgets WHERE id=?", budgetId))!); }
export async function setPrimaryBudget(id: string) { const db = await getDatabase(); await db.withTransactionAsync(async () => { await db.runAsync("UPDATE budgets SET is_primary=0 WHERE is_archived=0"); await db.runAsync("UPDATE budgets SET is_primary=1 WHERE id=? AND is_archived=0", id); }); }
export async function archiveBudget(id: string) { const db = await getDatabase(); await db.runAsync("UPDATE budgets SET is_archived=1,is_primary=0 WHERE id=?", id); const next = await db.getFirstAsync<{id:string}>("SELECT id FROM budgets WHERE is_archived=0 ORDER BY created_at ASC LIMIT 1"); if (next) await setPrimaryBudget(next.id); }
export async function deleteBudget(id: string) { const db = await getDatabase(); await db.runAsync("DELETE FROM budgets WHERE id=?", id); const primary = await db.getFirstAsync<{id:string}>("SELECT id FROM budgets WHERE is_archived=0 AND is_primary=1"); if (!primary) { const next = await db.getFirstAsync<{id:string}>("SELECT id FROM budgets WHERE is_archived=0 LIMIT 1"); if (next) await setPrimaryBudget(next.id); } }
export async function saveBill(input: RecurringBillInput, existingId?: string): Promise<RecurringBill> { const db = await getDatabase(); const now = new Date().toISOString(); const billId = existingId ?? id("bill"); await db.runAsync("INSERT INTO recurring_bills (id,name,amount,next_due_date,frequency,reminder_days_before,enabled,notification_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,amount=excluded.amount,next_due_date=excluded.next_due_date,frequency=excluded.frequency,reminder_days_before=excluded.reminder_days_before,enabled=excluded.enabled,updated_at=excluded.updated_at", billId,input.name,input.amount,input.nextDueDate,input.frequency,input.reminderDaysBefore,input.enabled ? 1:0,null,now,now); return toBill((await db.getFirstAsync<Record<string,unknown>>("SELECT * FROM recurring_bills WHERE id=?",billId))!); }
export async function deleteBill(id: string) { const db = await getDatabase(); await db.runAsync("DELETE FROM recurring_bills WHERE id=?", id); }
export async function updateBillNotification(id: string, notificationId: string | null) { const db = await getDatabase(); await db.runAsync("UPDATE recurring_bills SET notification_id=?,updated_at=? WHERE id=?",notificationId,new Date().toISOString(),id); }
