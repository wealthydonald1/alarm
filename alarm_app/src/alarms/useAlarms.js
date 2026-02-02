import { useEffect, useMemo, useState } from "react";
import { loadAlarms, saveAlarms } from "../storage/alarmsStorage";
import { nextOccurrenceDate } from "./alarmTime";
import { cancelAlarmNotification, scheduleAlarmAtDate } from "./notificationService";

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function todayISO() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function useAlarms() {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await loadAlarms();
      setAlarms(data);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (loading) return;
    saveAlarms(alarms);
  }, [alarms, loading]);

  async function ensureScheduled(alarm) {
    // cancel old schedule if exists
    if (alarm.notificationId) {
      await cancelAlarmNotification(alarm.notificationId);
    }

    const nextDate = nextOccurrenceDate(alarm);
    if (!nextDate) return null;

    const notifId = await scheduleAlarmAtDate(alarm, nextDate);
    return notifId;
  }

  const actions = useMemo(() => {
    return {
      async addAlarm(partial = {}) {
        const newAlarm = {
          id: uid(),
          label: partial.label ?? "Alarm",
          enabled: partial.enabled ?? true,
          time: partial.time ?? "07:00",
          repeatType: partial.repeatType ?? "weekly", // "once" | "weekly"
          daysActive: partial.daysActive ?? [1, 2, 3, 4, 5],
          dateISO: partial.dateISO ?? todayISO(),
          notificationId: null,
          createdAt: Date.now(),
        };

        // schedule if enabled
        let notificationId = null;
        if (newAlarm.enabled) {
          notificationId = await ensureScheduled(newAlarm);
        }

        const finalAlarm = { ...newAlarm, notificationId };

        setAlarms((prev) => [finalAlarm, ...prev]);
        return finalAlarm;
      },

      async toggleAlarm(id) {
        // we need the latest alarm from state
        const target = alarms.find((a) => a.id === id);
        if (!target) return;

        if (target.enabled) {
          // turning OFF
          if (target.notificationId) {
            await cancelAlarmNotification(target.notificationId);
          }
          setAlarms((prev) =>
            prev.map((a) =>
              a.id === id ? { ...a, enabled: false, notificationId: null } : a
            )
          );
        } else {
          // turning ON
          const nextOn = { ...target, enabled: true };
          const notifId = await ensureScheduled(nextOn);

          setAlarms((prev) =>
            prev.map((a) =>
              a.id === id ? { ...nextOn, notificationId: notifId } : a
            )
          );
        }
      },

      async updateAlarm(id, patch) {
        const target = alarms.find((a) => a.id === id);
        if (!target) return;

        const updated = { ...target, ...patch };

        // If enabled, re-schedule using new settings
        let notifId = updated.notificationId ?? null;
        if (updated.enabled) {
          notifId = await ensureScheduled(updated);
        } else {
          // if disabled, cancel any existing schedule
          if (updated.notificationId) await cancelAlarmNotification(updated.notificationId);
          notifId = null;
        }

        setAlarms((prev) =>
          prev.map((a) => (a.id === id ? { ...updated, notificationId: notifId } : a))
        );
      },

      async deleteAlarm(id) {
        const target = alarms.find((a) => a.id === id);
        if (target?.notificationId) {
          await cancelAlarmNotification(target.notificationId);
        }
        setAlarms((prev) => prev.filter((a) => a.id !== id));
      },
    };
  }, [alarms, loading]);

  return { alarms, loading, ...actions };
}