import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications/build/NotificationChannelManager.types";
import type { NotificationPreferences } from "@/features/finance/types";

const dailyIdentifier = "snapsend-daily-reminder";
const weeklyIdentifier = "snapsend-weekly-summary";
// Test-only: restore the daily calendar trigger before shipping.
const dailyReminderTestIntervalSeconds = 60;
const notificationChannelId = "finance-reminders";

/** Keeps opted-in local finance reminders scheduled without using a push service. */
export async function syncLocalReminders(preferences: NotificationPreferences): Promise<boolean> {
  if (!preferences.dailyReminderEnabled && !preferences.weeklySummaryEnabled) {
    await Notifications.cancelScheduledNotificationAsync(dailyIdentifier).catch(() => undefined);
    await Notifications.cancelScheduledNotificationAsync(weeklyIdentifier).catch(() => undefined);
    return true;
  }
  const channelId = Platform.OS === "android" ? notificationChannelId : undefined;
  if (channelId) await Notifications.setNotificationChannelAsync(channelId, { name: "Finance reminders", importance: AndroidImportance.DEFAULT });
  const permission = await Notifications.getPermissionsAsync();
  const status = permission.status === "granted" ? permission.status : (await Notifications.requestPermissionsAsync()).status;
  if (status !== "granted") return false;
  await Notifications.cancelScheduledNotificationAsync(dailyIdentifier).catch(() => undefined);
  await Notifications.cancelScheduledNotificationAsync(weeklyIdentifier).catch(() => undefined);
  if (preferences.dailyReminderEnabled) await Notifications.scheduleNotificationAsync({ identifier: dailyIdentifier, content: { title: "Log today’s expenses", body: "Keep your spending up to date.", data: { url: "/manual-expense" } }, trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: dailyReminderTestIntervalSeconds, repeats: true, channelId } });
  if (preferences.weeklySummaryEnabled) await Notifications.scheduleNotificationAsync({ identifier: weeklyIdentifier, content: { title: "Review your week", body: "See how your spending tracked against your budgets.", data: { url: "/(tabs)/budget" } }, trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: 1, hour: preferences.weeklySummaryHour, minute: 0, channelId } });
  return true;
}
