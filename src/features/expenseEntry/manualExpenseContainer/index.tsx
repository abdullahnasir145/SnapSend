import { ArrowLeft, Check, Plus } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Heading1, Heading3, Paragraph } from "@/components/ui/typography";
import { poppinsFontFamilyByWeight } from "@/constants/fonts";
import { useFinance } from "@/features/finance/FinanceProvider";
import { getCurrencySymbol, parseAmount } from "@/features/finance/utils";

/** Provides full manual expense entry with reusable custom categories. */
export function ManualExpenseContainer() {
  const { addCategory, addExpense, categories, currency, isLoading } = useFinance();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0]?.name ?? "Groceries");
  const [categoryName, setCategoryName] = useState("");
  const [merchant, setMerchant] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function createCategory() {
    try { const saved = await addCategory(categoryName); setCategory(saved.name); setCategoryName(""); setMessage(`“${saved.name}” is ready to use everywhere.`); }
    catch { setMessage("Enter a category name to save it."); }
  }

  async function saveExpense() {
    const parsedAmount = parseAmount(amount);
    if (!parsedAmount || !merchant.trim()) { setMessage("Add a description and an amount greater than zero."); return; }
    setSaving(true); setMessage("");
    try { await addExpense({ amount: parsedAmount, category, merchant: merchant.trim() }); router.back(); }
    catch { setMessage("Your expense could not be saved. Please try again."); }
    finally { setSaving(false); }
  }

  return <ScreenContainer><ScrollView className="flex-1" contentContainerClassName="gap-6 px-5 pb-8 pt-3" keyboardShouldPersistTaps="handled">
    <View className="flex-row items-center gap-3"><Pressable accessibilityLabel="Go back" className="h-10 w-10 items-center justify-center rounded-full bg-surface-secondary" onPress={() => router.back()}><ArrowLeft color="#087F5B" size={20} /></Pressable><View><Paragraph className="text-muted" size="sm">Expense entry</Paragraph><Heading1 size="2xl">Add manually</Heading1></View></View>
    <View className="rounded-card bg-surface p-5"><Heading3>Payment details</Heading3><TextInput accessibilityLabel="Expense description" className="mt-4 rounded-input border border-border bg-background px-4 py-3 text-base text-foreground" onChangeText={setMerchant} placeholder="Merchant or description" placeholderTextColor="#89968E" style={{ fontFamily: poppinsFontFamilyByWeight.normal }} value={merchant} /><View className="mt-3 flex-row items-center rounded-input border border-border bg-background px-4"><Paragraph className="text-muted" weight="semibold">{getCurrencySymbol(currency)}</Paragraph><TextInput accessibilityLabel="Expense amount" className="flex-1 px-3 py-3 text-base text-foreground" keyboardType="decimal-pad" onChangeText={setAmount} placeholder="0" placeholderTextColor="#89968E" style={{ fontFamily: poppinsFontFamilyByWeight.normal }} value={amount} /></View></View>
    <View className="rounded-card bg-surface p-5"><Heading3>Category</Heading3><Paragraph className="mt-1 text-muted" size="sm">Saved categories work in every entry method.</Paragraph><View className="mt-4 flex-row flex-wrap gap-2">{categories.map((item) => <Pressable accessibilityLabel={`Use ${item.name} category`} className={item.name === category ? "rounded-full bg-primary px-3 py-2" : "rounded-full bg-surface-secondary px-3 py-2"} key={item.id} onPress={() => setCategory(item.name)}><Paragraph className={item.name === category ? "text-primary-foreground" : "text-muted"} size="sm" weight="medium">{item.name}</Paragraph></Pressable>)}</View><View className="mt-4 flex-row gap-2"><TextInput accessibilityLabel="New category name" className="flex-1 rounded-input border border-border bg-background px-4 py-3 text-base text-foreground" onChangeText={setCategoryName} placeholder="Create a category" placeholderTextColor="#89968E" style={{ fontFamily: poppinsFontFamilyByWeight.normal }} value={categoryName} /><Pressable accessibilityLabel="Save new category" className="items-center justify-center rounded-input bg-primary px-4" onPress={createCategory}><Plus color="#FFFFFF" size={20} /></Pressable></View></View>
    {message ? <Paragraph className="text-muted" size="sm">{message}</Paragraph> : null}<Pressable accessibilityLabel="Save expense" className="flex-row items-center justify-center gap-2 rounded-input bg-primary px-4 py-4 active:opacity-85" disabled={saving || isLoading} onPress={saveExpense}><Check color="#FFFFFF" size={18} /><Paragraph className="text-primary-foreground" weight="semibold">{saving ? "Saving…" : "Save expense"}</Paragraph></Pressable>
  </ScrollView></ScreenContainer>;
}
