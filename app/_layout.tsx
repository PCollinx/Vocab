/**
 * Root Layout
 * Wraps the entire app with providers
 */

import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAppStore } from '../src/store/appStore';
import { ThemeProvider } from '../src/context/ThemeContext';
import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
  setupNotificationHandlers,
} from '../src/services/notificationService';

function AppStatusBar() {
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  return <StatusBar style={isDarkMode ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  const { loadUserData, addNotificationToHistory } = useAppStore();
  const cleanupNotifications = useRef<(() => void) | null>(null);

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
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
