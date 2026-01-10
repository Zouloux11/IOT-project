import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { colors } from '../constants/theme';
import { SensorProvider } from '../contexts/SensorContext';
import { registerForPushNotificationsAsync, sendPushTokenToBackend } from '../services/notifications';

function RootLayoutNav() {
  useEffect(() => {
    // Enregistrer pour les notifications
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        console.log('📱 Push Token:', token);
        sendPushTokenToBackend(token);
      }
    });

    // Écouter les notifications
    const subscription1 = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification reçue:', notification);
    });

    const subscription2 = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification cliquée');
    });

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SensorProvider>
        <RootLayoutNav />
      </SensorProvider>
    </SafeAreaProvider>
  );
}