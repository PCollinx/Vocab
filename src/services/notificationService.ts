/**
 * Notification Service
 * Handles scheduling word reminders throughout the day
 */

import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Word } from '../types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}

/**
 * Schedule word reminders for the day
 * Distributes the given words evenly throughout the day based on reminder time
 */
export async function scheduleWordReminders(
  words: Word[],
  dailyGoal: number,
  reminderTime: string
): Promise<boolean> {
  try {
    // Cancel existing notifications
    await cancelAllNotifications();

    if (!words || words.length === 0 || dailyGoal === 0) {
      return false;
    }

    // Get the number of words to show (min of dailyGoal and available words)
    const wordsToSchedule = words.slice(0, Math.min(dailyGoal, words.length));

    // Parse reminder time (format: "HH:MM")
    const [hours, minutes] = reminderTime.split(':').map(Number);
    
    // Calculate time slots throughout the day
    // If reminder time is 9:00 and daily goal is 5, schedule at:
    // 9:00, 11:00, 13:00, 15:00, 17:00 (2-hour intervals)
    const dayDurationMinutes = 8 * 60; // 8 hours from reminder time
    const intervalMinutes = Math.floor(dayDurationMinutes / wordsToSchedule.length);

    const notificationIds: string[] = [];

    for (let i = 0; i < wordsToSchedule.length; i++) {
      const word = wordsToSchedule[i];
      
      // Calculate notification time for this word
      const minuteOffset = i * intervalMinutes;
      const notificationDate = new Date();
      notificationDate.setHours(hours, minutes + minuteOffset, 0, 0);

      // If the calculated time is in the past, schedule for tomorrow
      if (notificationDate < new Date()) {
        notificationDate.setDate(notificationDate.getDate() + 1);
      }

      try {
        // Calculate seconds from now for the notification
        const secondsFromNow = Math.floor((notificationDate.getTime() - Date.now()) / 1000);
        
        // Only schedule if the time is in the future (at least 1 second from now)
        if (secondsFromNow > 0) {
          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: `📚 Word of the moment!`,
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

/**
 * Schedule a single notification for testing
 */
export async function scheduleTestNotification(word: Word, delaySeconds: number = 5): Promise<string | null> {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `📚 Test notification`,
        body: word.word,
        subtitle: word.partOfSpeech,
        data: {
          wordId: word.id,
          word: word.word,
          definition: word.definition,
        },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delaySeconds,
        repeats: false,
      },
    });

    return id;
  } catch (error) {
    console.error('Error scheduling test notification:', error);
    return null;
  }
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Handle notification response (when user taps on notification)
 */
export function setupNotificationHandlers(
  onResponseCallback?: (response: Notifications.NotificationResponse) => void,
  onReceivedCallback?: (notification: Notifications.Notification) => void
): () => void {
  const subscriptions: Array<{ remove: () => void }> = [];

  try {
    // Handle notification response (user taps notification)
    if (onResponseCallback) {
      const responseSubscription = Notifications.addNotificationResponseReceivedListener(
        onResponseCallback
      );
      subscriptions.push(responseSubscription);
    }

    // Listen for notifications received while app is in foreground
    if (onReceivedCallback) {
      const notificationSubscription = Notifications.addNotificationReceivedListener(
        onReceivedCallback
      );
      subscriptions.push(notificationSubscription);
    }
  } catch (error) {
    console.error('Error setting up notification handlers:', error);
  }

  // Return cleanup function
  return () => {
    subscriptions.forEach((subscription) => {
      try {
        subscription?.remove?.();
      } catch (error) {
        console.error('Error removing subscription:', error);
      }
    });
  };
}
