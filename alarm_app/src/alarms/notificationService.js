import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions() {
  if (!Device.isDevice) return;
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    console.warn("Notification permissions not granted");
  }
}

export async function scheduleAlarmAtDate(alarm, triggerDate) {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: alarm.label || "Alarm",
      body: "Time's up!",
      sound: true,
      data: { alarmId: alarm.id },
    },
    trigger: triggerDate,
  });

  return id;
}

export async function cancelAlarmNotification(notificationId) {
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function scheduleSnooze(alarm, minutes = 5) {
  const trigger = new Date(Date.now() + minutes * 60000);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: alarm.label || "Alarm",
      body: "Snoozed",
      sound: true,
      data: { alarmId: alarm.id, snooze: true },
    },
    trigger,
  });

  return id;
}