/**
 * Root Layout
 * Wraps the entire app with providers
 */

import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAppStore } from '../src/store/appStore';
import { requestNotificationPermission, setupNotificationHandlers } from '../src/services/notificationService';

export default function RootLayout() {
  const { loadUserData, hasCompletedOnboarding, addNotificationToHistory } = useAppStore();
  const cleanupNotifications = useRef<(() => void) | null>(null);

  useEffect(() => {
    loadUserData();
    
    try {
      // Request notification permissions
      requestNotificationPermission().catch(error => 
        console.error('Error requesting notification permissions:', error)
      );
      
      // Set up notification handlers
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
            console.error('Error handling notification response:', error);
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
            console.error('Error handling received notification:', error);
          }
        }
      );
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }

    // Cleanup on unmount
    return () => {
      if (cleanupNotifications.current) {
        try {
          cleanupNotifications.current();
        } catch (error) {
          console.error('Error cleaning up notifications:', error);
        }
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
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
    </SafeAreaProvider>
  );
}
