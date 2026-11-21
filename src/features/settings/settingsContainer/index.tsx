import {
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Database,
  FolderKey,
  MoonStar,
  ShieldCheck,
  WalletCards,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Switch,
  TextInput,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/layout/ScreenContainer";
import {
  Heading1,
  Heading2,
  Heading3,
  Paragraph,
} from "@/components/ui/typography";
import { useFinance } from "@/features/finance/FinanceProvider";
import type { AppearancePreference } from "@/features/finance/types";

const fallbackCurrencies = [
  "AED",
  "AUD",
  "BDT",
  "BRL",
  "CAD",
  "CHF",
  "CNY",
  "DKK",
  "EGP",
  "EUR",
  "GBP",
  "HKD",
  "IDR",
  "INR",
  "JPY",
  "KES",
  "KRW",
  "KWD",
  "MXN",
  "MYR",
  "NGN",
  "NOK",
  "NZD",
  "OMR",
  "PHP",
  "PKR",
  "PLN",
  "QAR",
  "SAR",
  "SEK",
  "SGD",
  "THB",
  "TRY",
  "USD",
  "ZAR",
];
const currencyCodes =
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("currency")
    : fallbackCurrencies;

function getCurrencyName(currency: string) {
  try {
    return (
      new Intl.DisplayNames(["en"], { type: "currency" }).of(currency) ??
      currency
    );
  } catch {
    return currency;
  }
}

export interface SettingsRowProps {
  accessibilityHint?: string;
  accessibilityLabel: string;
  icon: ReactNode;
  onPress?: () => void;
  title: string;
  value: string;
}

/** Presents a compact settings value, optionally as an actionable navigation row. */
function SettingsRow({
  accessibilityHint,
  accessibilityLabel,
  icon,
  onPress,
  title,
  value,
}: SettingsRowProps) {
  const content = (
    <>
      <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-secondary">
        {icon}
      </View>
      <View className="flex-1">
        <Paragraph weight="medium">{title}</Paragraph>
        <Paragraph className="mt-0.5 text-muted" size="sm">
          {value}
        </Paragraph>
      </View>
      {onPress ? <ChevronRight color="#89968E" size={20} /> : null}
    </>
  );
  if (!onPress)
    return <View className="flex-row items-center gap-3 py-3">{content}</View>;
  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      className="flex-row items-center gap-3 py-3 active:opacity-70"
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
}

/** Renders app preferences, local-data details, and development-only inspection tools. */
export function SettingsContainer() {
  const {
    appearance,
    budgets,
    categories,
    currency,
    expenses,
    isLoading,
    notificationPreferences,
    setAppearance,
    setCurrency,
    setNotificationPreferences,
  } = useFinance();
  const [developerExpanded, setDeveloperExpanded] = useState(false);
  const [currencyPickerVisible, setCurrencyPickerVisible] = useState(false);
  const [currencyQuery, setCurrencyQuery] = useState("");
  const visibleCurrencies = currencyCodes.filter((item) =>
    `${item} ${getCurrencyName(item)}`
      .toLocaleLowerCase()
      .includes(currencyQuery.trim().toLocaleLowerCase()),
  );

  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-5 pb-8 pt-3"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Paragraph className="text-muted" size="sm" weight="medium">
            App preferences
          </Paragraph>
          <Heading1 size="2xl">Settings</Heading1>
        </View>
        <View className="flex-row gap-3 rounded-card bg-surface p-5">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-soft">
            <ShieldCheck color="#087F5B" size={20} />
          </View>
          <View className="flex-1">
            <Heading3>Local by default</Heading3>
            <Paragraph className="mt-1 text-muted" size="sm">
              Your budget, categories, and expenses stay on this device.
              SnapSend does not use an account or cloud sync.
            </Paragraph>
          </View>
        </View>
        <View>
          <Heading2 size="xl">Preferences</Heading2>
          <View className="mt-2 rounded-card bg-surface px-4">
            <Pressable
              accessibilityHint="Opens the full currency list"
              accessibilityLabel="Choose currency"
              className="flex-row items-center gap-3 border-b border-border py-4 active:opacity-70"
              onPress={() => setCurrencyPickerVisible(true)}
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-secondary">
                <WalletCards color="#087F5B" size={20} />
              </View>
              <View className="flex-1">
                <Paragraph weight="medium">Currency</Paragraph>
                <Paragraph className="mt-0.5 text-muted" size="sm">
                  {currency} · {getCurrencyName(currency)}
                </Paragraph>
              </View>
              <ChevronRight color="#89968E" size={20} />
            </Pressable>
            <View className="py-3">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-secondary">
                  <MoonStar color="#087F5B" size={20} />
                </View>
                <View className="flex-1">
                  <Paragraph weight="medium">Appearance</Paragraph>
                  <Paragraph className="mt-0.5 text-muted" size="sm">
                    Choose light, dark, or follow your device.
                  </Paragraph>
                </View>
              </View>
              <View className="mt-3 flex-row gap-2">
                {(["system", "light", "dark"] as AppearancePreference[]).map(
                  (item) => (
                    <Pressable
                      accessibilityLabel={`Use ${item} appearance`}
                      className={
                        appearance === item
                          ? "flex-1 rounded-input bg-primary py-2"
                          : "flex-1 rounded-input bg-surface-secondary py-2"
                      }
                      key={item}
                      onPress={() => void setAppearance(item)}
                    >
                      <Paragraph
                        className={
                          appearance === item
                            ? "text-center text-primary-foreground"
                            : "text-center text-muted"
                        }
                        size="sm"
                        weight="semibold"
                      >
                        {item[0].toUpperCase() + item.slice(1)}
                      </Paragraph>
                    </Pressable>
                  ),
                )}
              </View>
            </View>
          </View>
        </View>
        <View>
          <Heading2 size="xl">Reminders</Heading2>
          <View className="mt-2 rounded-card bg-surface px-4">
            {(
              [
                ["dailyReminderEnabled", "Daily expense reminder"],
                ["weeklySummaryEnabled", "Weekly summary"],
                ["budgetAlertsEnabled", "Budget alerts"],
              ] as const
            ).map(([key, label]) => (
              <View
                className="flex-row items-center justify-between border-b border-border py-4 last:border-b-0"
                key={key}
              >
                <View className="flex-1">
                  <Paragraph weight="medium">{label}</Paragraph>
                  <Paragraph className="text-muted" size="sm">
                    {key === "dailyReminderEnabled"
                      ? "Repeats every minute for testing"
                      : "Local notification only"}
                  </Paragraph>
                </View>
                <Switch
                  value={notificationPreferences[key]}
                  onValueChange={(value) =>
                    void setNotificationPreferences({
                      ...notificationPreferences,
                      [key]: value,
                    })
                  }
                />
              </View>
            ))}
          </View>
        </View>
        <View>
          <Heading2 size="xl">Your data</Heading2>
          <View className="mt-2 divide-y divide-border rounded-card bg-surface px-4">
            <SettingsRow
              accessibilityLabel="Local data storage"
              icon={<Database color="#087F5B" size={20} />}
              title="Storage"
              value={
                isLoading
                  ? "Reading device data…"
                  : `${expenses.length} expenses saved locally`
              }
            />
            <SettingsRow
              accessibilityLabel="Saved expense categories"
              icon={<FolderKey color="#087F5B" size={20} />}
              title="Categories"
              value={
                isLoading
                  ? "Loading…"
                  : `${categories.length} reusable categories`
              }
            />
          </View>
        </View>
        <View>
          <Heading2 size="xl">About</Heading2>
          <View className="mt-2 rounded-card bg-surface px-4">
            <SettingsRow
              accessibilityLabel="About SnapSend"
              icon={<CircleHelp color="#087F5B" size={20} />}
              title="SnapSend"
              value="Version 1.0.0 · Local-first expense tracking"
            />
          </View>
        </View>
        {__DEV__ ? (
          <View className="rounded-card border border-dashed border-primary/40 bg-primary-soft/40">
            <Pressable
              accessibilityLabel="Developer tools"
              className="flex-row items-center gap-3 p-5"
              onPress={() =>
                setDeveloperExpanded((currentValue) => !currentValue)
              }
            >
              <Database color="#087F5B" size={20} />
              <View className="flex-1">
                <Heading2 size="xl">Developer</Heading2>
                <Paragraph className="text-muted" size="sm">
                  {budgets.length} budgets · {expenses.length} expenses
                </Paragraph>
              </View>
              {developerExpanded ? (
                <ChevronDown color="#087F5B" size={20} />
              ) : (
                <ChevronRight color="#087F5B" size={20} />
              )}
            </Pressable>
          </View>
        ) : null}
        <Modal
          animationType="slide"
          onRequestClose={() => setCurrencyPickerVisible(false)}
          transparent
          visible={currencyPickerVisible}
        >
          <View className="flex-1 justify-end bg-black/40">
            <View className="max-h-[82%] rounded-t-card bg-background px-5 pb-8 pt-5">
              <View className="flex-row items-center justify-between">
                <View>
                  <Heading2>Choose currency</Heading2>
                  <Paragraph className="text-muted" size="sm">
                    Display only — no exchange conversion.
                  </Paragraph>
                </View>
                <Pressable
                  accessibilityLabel="Close currency picker"
                  className="rounded-full bg-surface-secondary px-3 py-2"
                  onPress={() => setCurrencyPickerVisible(false)}
                >
                  <Paragraph size="sm" weight="semibold">
                    Close
                  </Paragraph>
                </Pressable>
              </View>
              <TextInput
                accessibilityLabel="Search currencies"
                className="mt-4 rounded-input border border-border bg-surface px-4 py-3 text-foreground"
                onChangeText={setCurrencyQuery}
                placeholder="Search by code or name"
                placeholderTextColor="#89968E"
                value={currencyQuery}
              />
              <ScrollView className="mt-3">
                {visibleCurrencies.map((item) => (
                  <Pressable
                    accessibilityLabel={`Select ${item}`}
                    className="flex-row items-center justify-between border-b border-border py-4 active:opacity-70"
                    key={item}
                    onPress={() => {
                      void setCurrency(item);
                      setCurrencyPickerVisible(false);
                      setCurrencyQuery("");
                    }}
                  >
                    <View>
                      <Paragraph weight="semibold">{item}</Paragraph>
                      <Paragraph className="text-muted" size="sm">
                        {getCurrencyName(item)}
                      </Paragraph>
                    </View>
                    <Paragraph
                      className={
                        currency === item ? "text-primary" : "text-muted"
                      }
                      weight="semibold"
                    >
                      {currency === item ? "Selected" : ""}
                    </Paragraph>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </ScreenContainer>
  );
}
