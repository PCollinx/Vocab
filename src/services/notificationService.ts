/**
 * Notification Service
 * Handles scheduling word reminders throughout the day.
 *
 * expo-notifications throws during module initialization on Android Expo Go (SDK 53+).
 * To prevent this from crashing the whole app, we load the module at runtime via
 * require() inside a try-catch instead of using a top-level ES import.
 * `import type` is used only for TypeScript types — it compiles to nothing at runtime.
 */

import { Platform } from 'react-native';
import type * as NotificationsType from 'expo-notifications';
import { Word } from '../types';

// Runtime reference — null when not available (Expo Go on Android)
let Notifications: typeof NotificationsType | null = null;
let SchedulableTriggerInputTypes: typeof NotificationsType.SchedulableTriggerInputTypes | null = null;
let notificationsAvailable = false;

try {
  const mod = require('expo-notifications') as typeof NotificationsType;
  Notifications = mod;
  SchedulableTriggerInputTypes = mod.SchedulableTriggerInputTypes;

  mod.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  notificationsAvailable = true;
} catch {
  if (__DEV__) console.warn('expo-notifications: not available in this environment. Use a development build for full notification support.');
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function getNotificationPermissionStatus(): Promise<string | null> {
  if (!notificationsAvailable || !Notifications) return null;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch {
    return null;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!notificationsAvailable || !Notifications) return false;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    if (__DEV__) console.error('Error requesting notification permissions:', error);
    return false;
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (!notificationsAvailable || !Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    if (__DEV__) console.error('Error canceling notifications:', error);
  }
}

/**
 * Schedules 4 daily repeating reminders spaced 4 hours apart starting from
 * reminderTime. Each slot teases one word from the user's daily carousel to
 * draw them back into the app. Notifications repeat every day without
 * requiring the app to be opened.
 */
export async function scheduleWordReminders(
  words: Word[],
  reminderTime: string
): Promise<boolean> {
  if (!notificationsAvailable || !Notifications || !SchedulableTriggerInputTypes) return false;
  try {
    await cancelAllNotifications();

    const [startHour, startMinute] = reminderTime.split(':').map(Number);
    const SLOTS = 4;
    const notificationIds: string[] = [];

    for (let i = 0; i < SLOTS; i++) {
      const hour = (startHour + i * 4) % 24;

      // Pick a word for this slot — cycle through available words
      const word = words.length > 0 ? words[i % words.length] : null;

      const title = '📚 WordWise';
      const body = word
        ? `Do you know what "${word.word}" means? Open WordWise to learn today's words.`
        : "Your daily words are waiting. Open WordWise and keep your streak alive! 🔥";

      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: word
              ? { word: word.word, definition: word.definition }
              : {},
          },
          trigger: Platform.OS === 'android'
            ? {
                type: SchedulableTriggerInputTypes.DAILY,
                hour,
                minute: startMinute,
              }
            : {
                type: SchedulableTriggerInputTypes.CALENDAR,
                hour,
                minute: startMinute,
                repeats: true,
              },
        });
        notificationIds.push(id);
      } catch (error) {
        if (__DEV__) console.error(`Error scheduling reminder slot ${i}:`, error);
      }
    }

    return notificationIds.length > 0;
  } catch (error) {
    if (__DEV__) console.error('Error scheduling word reminders:', error);
    return false;
  }
}

export async function scheduleTestNotification(
  word: Word,
  delaySeconds = 5
): Promise<string | null> {
  if (!notificationsAvailable || !Notifications || !SchedulableTriggerInputTypes) return null;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: '📚 Test notification',
        body: word.word,
        subtitle: word.partOfSpeech,
        data: { wordId: word.id, word: word.word, definition: word.definition },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delaySeconds,
        repeats: false,
      },
    });
  } catch (error) {
    if (__DEV__) console.error('Error scheduling test notification:', error);
    return null;
  }
}

export async function getAllScheduledNotifications(): Promise<
  NotificationsType.NotificationRequest[]
> {
  if (!notificationsAvailable || !Notifications) return [];
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    if (__DEV__) console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

export function setupNotificationHandlers(
  onResponseCallback?: (response: NotificationsType.NotificationResponse) => void,
  onReceivedCallback?: (notification: NotificationsType.Notification) => void
): () => void {
  if (!notificationsAvailable || !Notifications) return () => {};

  const subscriptions: Array<{ remove: () => void }> = [];

  try {
    if (onResponseCallback) {
      subscriptions.push(
        Notifications.addNotificationResponseReceivedListener(onResponseCallback)
      );
    }
    if (onReceivedCallback) {
      subscriptions.push(
        Notifications.addNotificationReceivedListener(onReceivedCallback)
      );
    }
  } catch (error) {
    if (__DEV__) console.error('Error setting up notification handlers:', error);
  }

  return () => {
    subscriptions.forEach(s => {
      try { s?.remove?.(); } catch {}
    });
  };
}
