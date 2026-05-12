/**
 * Notification Service
 * Handles scheduling word reminders throughout the day.
 *
 * expo-notifications throws during module initialization on Android Expo Go (SDK 53+).
 * To prevent this from crashing the whole app, we load the module at runtime via
 * require() inside a try-catch instead of using a top-level ES import.
 * `import type` is used only for TypeScript types — it compiles to nothing at runtime.
 */

import type * as NotificationsType from 'expo-notifications';
import { Word } from '../types';

// Runtime reference — null when not available (Expo Go on Android)
let Notifications: typeof NotificationsType | null = null;
let SchedulableTriggerInputTypes: typeof NotificationsType.SchedulableTriggerInputTypes | null = null;
let notificationsAvailable = false;

try {
  // require() can be wrapped in try-catch; top-level import cannot.
  const mod = require('expo-notifications') as typeof NotificationsType;
  Notifications = mod;
  SchedulableTriggerInputTypes = mod.SchedulableTriggerInputTypes;

  mod.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  notificationsAvailable = true;
} catch {
  console.warn(
    'expo-notifications: not available in this environment. ' +
      'Use a development build for full notification support.'
  );
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (!notificationsAvailable || !Notifications) return false;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (!notificationsAvailable || !Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}

export async function scheduleWordReminders(
  words: Word[],
  dailyGoal: number,
  reminderTime: string
): Promise<boolean> {
  if (!notificationsAvailable || !Notifications || !SchedulableTriggerInputTypes) return false;
  try {
    await cancelAllNotifications();

    if (!words || words.length === 0 || dailyGoal === 0) return false;

    const wordsToSchedule = words.slice(0, Math.min(dailyGoal, words.length));
    const [hours, minutes] = reminderTime.split(':').map(Number);
    const intervalMinutes = Math.floor((8 * 60) / wordsToSchedule.length);
    const notificationIds: string[] = [];

    for (let i = 0; i < wordsToSchedule.length; i++) {
      const word = wordsToSchedule[i];
      const minuteOffset = i * intervalMinutes;
      const notificationDate = new Date();
      notificationDate.setHours(hours, minutes + minuteOffset, 0, 0);

      if (notificationDate < new Date()) {
        notificationDate.setDate(notificationDate.getDate() + 1);
      }

      try {
        const secondsFromNow = Math.floor((notificationDate.getTime() - Date.now()) / 1000);
        if (secondsFromNow > 0) {
          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: '📚 Word of the moment!',
              body: word.word,
              subtitle: word.partOfSpeech,
              data: {
                wordId: word.id,
                word: word.word,
                definition: word.definition,
                example: word.example,
              },
            },
            trigger: {
              type: SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: secondsFromNow,
              repeats: false,
            },
          });
          notificationIds.push(id);
        }
      } catch (error) {
        console.error(`Error scheduling notification for word ${word.word}:`, error);
      }
    }

    return notificationIds.length > 0;
  } catch (error) {
    console.error('Error scheduling word reminders:', error);
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
    console.error('Error scheduling test notification:', error);
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
    console.error('Error getting scheduled notifications:', error);
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
    console.error('Error setting up notification handlers:', error);
  }

  return () => {
    subscriptions.forEach(s => {
      try { s?.remove?.(); } catch {}
    });
  };
}
