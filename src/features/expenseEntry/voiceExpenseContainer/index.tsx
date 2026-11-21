import { ArrowLeft, Check, Mic, Square } from "lucide-react-native";
import { router } from "expo-router";
import { requireOptionalNativeModule } from "expo-modules-core";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Heading1, Heading3, Paragraph } from "@/components/ui/typography";
import { poppinsFontFamilyByWeight } from "@/constants/fonts";
import { useFinance } from "@/features/finance/FinanceProvider";
import { getCurrencySymbol, parseAmount } from "@/features/finance/utils";

interface SpeechRecognitionModule {
  addListener: (eventName: string, listener: (event: { results?: Array<{ transcript: string }> }) => void) => { remove: () => void };
  requestPermissionsAsync: () => Promise<{ granted: boolean }>;
  start: (options: { continuous: boolean; interimResults: boolean; lang: string }) => void;
  stop: () => void;
}

// Expo Go does not include this custom native module, so optional lookup keeps the route load-safe.
const speechRecognitionModule = requireOptionalNativeModule<SpeechRecognitionModule>("ExpoSpeechRecognition");

/** Captures a spoken expense, lets the user confirm it, and saves it locally. */
export function VoiceExpenseContainer() {
  const { addExpense, categories, currency } = useFinance();
  const [amount, setAmount] = useState(""); const [category, setCategory] = useState(categories[0]?.name ?? "Groceries"); const [merchant, setMerchant] = useState(""); const [message, setMessage] = useState(""); const [recognizing, setRecognizing] = useState(false); const [saving, setSaving] = useState(false);
  const speechModuleRef = useRef<SpeechRecognitionModule | null>(null);
  const subscriptionRef = useRef<Array<{ remove: () => void }>>([]);

  useEffect(() => () => subscriptionRef.current.forEach((subscription) => subscription.remove()), []);

  async function toggleListening() {
    if (recognizing && speechModuleRef.current) { speechModuleRef.current.stop(); return; }
    try {
      const nativeModule = speechRecognitionModule;
      if (!nativeModule) { setMessage("Voice recognition needs a SnapSend development build. You can still enter the details below."); return; }
      const permission = await nativeModule.requestPermissionsAsync();
      if (!permission.granted) { setMessage("Microphone and speech permission are needed for voice entry."); return; }
      subscriptionRef.current.forEach((subscription) => subscription.remove());
      subscriptionRef.current = [
        nativeModule.addListener("start", () => setRecognizing(true)),
        nativeModule.addListener("end", () => setRecognizing(false)),
        nativeModule.addListener("result", (event) => { const transcript = event.results?.[0]?.transcript ?? ""; setMerchant(transcript); const detectedAmount = transcript.match(/\b\d[\d,.]*/)?.[0]; if (detectedAmount) setAmount(detectedAmount.replace(/,/g, "")); }),
        nativeModule.addListener("error", () => { setRecognizing(false); setMessage("Speech recognition is unavailable. You can still edit the details below."); }),
      ];
      speechModuleRef.current = nativeModule;
      nativeModule.start({ lang: "en-PK", interimResults: true, continuous: false });
    } catch {
      setMessage("Voice recognition needs a SnapSend development build. You can still enter the details below.");
    }
  }
  async function saveExpense() { const parsedAmount = parseAmount(amount); if (!parsedAmount || !merchant.trim()) { setMessage("Confirm a description and amount greater than zero."); return; } setSaving(true); try { await addExpense({ amount: parsedAmount, category, merchant: merchant.trim() }); router.back(); } catch { setMessage("Your expense could not be saved. Please try again."); } finally { setSaving(false); } }
  return <ScreenContainer><ScrollView className="flex-1" contentContainerClassName="gap-6 px-5 pb-8 pt-3" keyboardShouldPersistTaps="handled"><View className="flex-row items-center gap-3"><Pressable accessibilityLabel="Go back" className="h-10 w-10 items-center justify-center rounded-full bg-surface-secondary" onPress={() => router.back()}><ArrowLeft color="#087F5B" size={20} /></Pressable><View><Paragraph className="text-muted" size="sm">Expense entry</Paragraph><Heading1 size="2xl">Add by voice</Heading1></View></View><View className="items-center rounded-card bg-primary-soft p-6"><Pressable accessibilityLabel={recognizing ? "Stop listening" : "Start listening"} className="h-20 w-20 items-center justify-center rounded-full bg-primary" onPress={toggleListening}>{recognizing ? <Square color="#FFFFFF" fill="#FFFFFF" size={25} /> : <Mic color="#FFFFFF" size={30} />}</Pressable><Heading3 className="mt-4 text-primary">{recognizing ? "Listening…" : "Tap to speak"}</Heading3><Paragraph className="mt-1 text-center text-muted" size="sm">Try “1,200 at the supermarket”. Review before saving.</Paragraph></View><View className="rounded-card bg-surface p-5"><Heading3>Review expense</Heading3><TextInput accessibilityLabel="Spoken expense description" className="mt-4 rounded-input border border-border bg-background px-4 py-3 text-base text-foreground" onChangeText={setMerchant} placeholder="What did you pay for?" placeholderTextColor="#89968E" style={{ fontFamily: poppinsFontFamilyByWeight.normal }} value={merchant} /><View className="mt-3 flex-row items-center rounded-input border border-border bg-background px-4"><Paragraph className="text-muted" weight="semibold">{getCurrencySymbol(currency)}</Paragraph><TextInput accessibilityLabel="Spoken expense amount" className="flex-1 px-3 py-3 text-base text-foreground" keyboardType="decimal-pad" onChangeText={setAmount} placeholder="0" placeholderTextColor="#89968E" style={{ fontFamily: poppinsFontFamilyByWeight.normal }} value={amount} /></View><View className="mt-4 flex-row flex-wrap gap-2">{categories.map((item) => <Pressable className={item.name === category ? "rounded-full bg-primary px-3 py-2" : "rounded-full bg-surface-secondary px-3 py-2"} key={item.id} onPress={() => setCategory(item.name)}><Paragraph className={item.name === category ? "text-primary-foreground" : "text-muted"} size="sm">{item.name}</Paragraph></Pressable>)}</View></View>{message ? <Paragraph className="text-muted" size="sm">{message}</Paragraph> : null}<Pressable accessibilityLabel="Save voice expense" className="flex-row items-center justify-center gap-2 rounded-input bg-primary px-4 py-4" disabled={saving} onPress={saveExpense}><Check color="#FFFFFF" size={18} /><Paragraph className="text-primary-foreground" weight="semibold">{saving ? "Saving…" : "Save expense"}</Paragraph></Pressable></ScrollView></ScreenContainer>;
}
