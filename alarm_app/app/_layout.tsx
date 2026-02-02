import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { requestPermissions } from "../src/alarms/notificationService";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    requestPermissions();

    const subReceive = Notifications.addNotificationReceivedListener((n) => {
      const alarmId = n.request.content.data?.alarmId;
      if (alarmId) {
        // Foreground: auto-open ring screen
        router.push({ pathname: "/ring", params: { alarmId: String(alarmId) } });
      }
    });

    const subResponse =
      Notifications.addNotificationResponseReceivedListener((resp) => {
        const alarmId = resp.notification.request.content.data?.alarmId;
        if (alarmId) {
          // Background/tapped: open ring screen
          router.push({ pathname: "/ring", params: { alarmId: String(alarmId) } });
        }
      });

    return () => {
      subReceive.remove();
      subResponse.remove();
    };
  }, [router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="ring" />
    </Stack>
  );
}