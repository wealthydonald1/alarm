import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "../src/theme/colors";
import { spacing } from "../src/theme/spacing";
import { getAlarmById, loadAlarms, saveAlarms } from "../src/storage/alarmsStorage";
import { hhmmTo12h, nextOccurrenceDate } from "../src/alarms/alarmTime";
import { cancelAlarmNotification, scheduleAlarmAtDate, scheduleSnooze } from "../src/alarms/notificationService";

export default function RingPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const alarmId = String(params.alarmId || "");

  const [alarm, setAlarm] = useState<any>(null);

  useEffect(() => {
    (async () => {
      if (!alarmId) return;
      const a = await getAlarmById(alarmId);
      setAlarm(a);
    })();
  }, [alarmId]);

  const display = useMemo(() => {
    if (!alarm?.time) return { time: "00:00", ampm: "" };
    return hhmmTo12h(alarm.time);
  }, [alarm]);

  async function updateAlarmInStorage(id: string, patch: any) {
    const all = await loadAlarms();
    const next = all.map((a) => (a.id === id ? { ...a, ...patch } : a));
    await saveAlarms(next);
    const refreshed = next.find((a) => a.id === id) ?? null;
    setAlarm(refreshed);
    return refreshed;
  }

  async function rescheduleIfNeeded(updatedAlarm: any) {
    if (!updatedAlarm?.enabled) return;

    // cancel old schedule if exists
    if (updatedAlarm.notificationId) {
      await cancelAlarmNotification(updatedAlarm.notificationId);
    }

    const nextDate = nextOccurrenceDate(updatedAlarm);
    if (!nextDate) {
      await updateAlarmInStorage(updatedAlarm.id, { notificationId: null });
      return;
    }

    const notifId = await scheduleAlarmAtDate(updatedAlarm, nextDate);
    await updateAlarmInStorage(updatedAlarm.id, { notificationId: notifId });
  }

  async function onSnooze() {
    if (!alarm) return;
    await scheduleSnooze(alarm, 5);
    router.back();
  }

  async function onDismiss() {
    if (!alarm) return;

    if (alarm.repeatType === "once") {
      // turn it OFF permanently after it rings once
      if (alarm.notificationId) await cancelAlarmNotification(alarm.notificationId);
      await updateAlarmInStorage(alarm.id, { enabled: false, notificationId: null });
      router.back();
      return;
    }

    // weekly: keep enabled, schedule the next occurrence
    const updated = await updateAlarmInStorage(alarm.id, { enabled: true });
    await rescheduleIfNeeded(updated);
    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>ALARM</Text>
      <Text style={styles.label}>{alarm?.label || "Alarm"}</Text>

      <View style={styles.timeRow}>
        <Text style={styles.time}>{display.time}</Text>
        {!!display.ampm && <Text style={styles.ampm}>{display.ampm}</Text>}
      </View>

      <View style={styles.buttons}>
        <Pressable style={styles.snoozeBtn} onPress={onSnooze}>
          <Text style={styles.snoozeText}>SNOOZE</Text>
        </Pressable>

        <Pressable style={styles.dismissBtn} onPress={onDismiss}>
          <Text style={styles.dismissText}>DISMISS</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.charcoal,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  kicker: {
    color: colors.pumpkin,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 10,
  },
  label: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: spacing.md,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginBottom: spacing.xl,
  },
  time: {
    color: colors.white,
    fontSize: 72,
    fontWeight: "900",
    letterSpacing: -2,
  },
  ampm: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "900",
    paddingBottom: 18,
    opacity: 0.95,
  },
  buttons: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  snoozeBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  snoozeText: {
    color: colors.white,
    fontWeight: "900",
  },
  dismissBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 18,
    backgroundColor: colors.pumpkin,
  },
  dismissText: {
    color: colors.white,
    fontWeight: "900",
  },
});