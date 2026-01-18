import { Stack } from 'expo-router';
import { useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { colors } from '../constants/theme';
import { SensorProvider } from '../contexts/SensorContext';
import { registerForPushNotificationsAsync, sendPushTokenToBackend } from '../services/notifications';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function RootLayoutNav() {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Enregistrer pour les notifications
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        console.log('📱 Push Token:', token);
        sendPushTokenToBackend(token);
      }
    });

    // Écouter les notifications reçues
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification reçue:', notification);
    });

    // Écouter les clics sur notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification cliquée');
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
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