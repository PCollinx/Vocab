/**
 * Root Layout
 * Wraps the entire app with providers
 */

import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { initSentry } from '../src/services/sentry';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../src/services/firebase';
import { useAppStore } from '../src/store/appStore';
import { ThemeProvider } from '../src/context/ThemeContext';
import { ErrorBoundary } from '../src/components';
import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
  setupNotificationHandlers,
} from '../src/services/notificationService';

initSentry();

function AppStatusBar() {
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  return <StatusBar style={isDarkMode ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  const router = useRouter();
  const { loadUserData, addNotificationToHistory } = useAppStore();
  const cleanupNotifications = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      const current = useAppStore.getState();
      useAppStore.setState({
        isLoggedIn: !!user,
        userEmail: user?.email ?? current.userEmail,
        userName: user?.displayName ?? current.userName,
      });
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    loadUserData();

    try {
      getNotificationPermissionStatus().then(status => {
        if (status === 'undetermined') {
          Alert.alert(
            'Stay on Track 🔔',
            'WordWise can send you daily word reminders to help build your vocabulary streak. You can change this anytime in Settings.',
            [
              { text: 'Not Now', style: 'cancel' },
              {
                text: 'Allow Notifications',
                onPress: () => requestNotificationPermission().catch(error => {
                  if (__DEV__) console.error('Error requesting notification permissions:', error);
                }),
              },
            ]
          );
        }
      }).catch(error => {
        if (__DEV__) console.error('Error checking notification permission status:', error);
      });

      cleanupNotifications.current = setupNotificationHandlers(
        (response) => {
          try {
            const data = response.notification.request.content.data as Record<string, string>;
            if (data?.word) {
              addNotificationToHistory({
                id: response.notification.request.identifier,
                word: data.word,
                definition: data.definition ?? '',
              });
              router.push(`/word/${data.word}`);
            }
          } catch (error) {
            if (__DEV__) console.error('Error handling notification response:', error);
          }
        },
        (notification) => {
          try {
            const data = notification.request.content.data as Record<string, string>;
            if (data?.word) {
              addNotificationToHistory({
                id: notification.request.identifier,
                word: data.word,
                definition: data.definition ?? '',
              });
            }
          } catch (error) {
            if (__DEV__) console.error('Error handling received notification:', error);
          }
        }
      );

      // Handle cold-start: app was killed and user tapped a notification to open it.
      // addNotificationResponseReceivedListener misses this case because the tap
      // happened before the listener was registered. getLastNotificationResponseAsync
      // retrieves it. We check notificationHistory to avoid re-navigating on normal
      // app opens where the old response is still cached by expo-notifications.
      (async () => {
        try {
          const Notifications = require('expo-notifications');
          const lastResponse = await Notifications.getLastNotificationResponseAsync();
          if (lastResponse) {
            const data = lastResponse.notification.request.content.data as Record<string, string>;
            const id = lastResponse.notification.request.identifier;
            if (data?.word) {
              const alreadyHandled = useAppStore.getState().notificationHistory.some(h => h.id === id);
              if (!alreadyHandled) {
                addNotificationToHistory({ id, word: data.word, definition: data.definition ?? '' });
                setTimeout(() => router.push(`/word/${data.word}`), 300);
              }
            }
          }
        } catch (error) {
          if (__DEV__) console.error('Error handling cold-start notification:', error);
        }
      })();
    } catch (error) {
      if (__DEV__) console.error('Error setting up notifications:', error);
    }

    return () => {
      if (cleanupNotifications.current) {
        try {
          cleanupNotifications.current();
        } catch (error) {
          if (__DEV__) console.error('Error cleaning up notifications:', error);
        }
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <AppStatusBar />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="auth" options={{ gestureEnabled: false }} />
            <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
            <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
            <Stack.Screen
              name="word/[id]"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
          </Stack>
        </ErrorBoundary>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
