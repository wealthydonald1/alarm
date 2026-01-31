import { useEffect, useMemo, useState } from "react";
import { loadAlarms, saveAlarms } from "../storage/alarmsStorage";

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
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

  const actions = useMemo(() => {
    return {
      addAlarm(partial = {}) {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");

        const newAlarm = {
          id: uid(),
          label: partial.label ?? "Alarm",
          enabled: partial.enabled ?? true,

          // time is stored as "HH:mm"
          time: partial.time ?? "07:00",

          // repeat rules
          repeatType: partial.repeatType ?? "weekly", // "once" | "weekly"
          daysActive: partial.daysActive ?? [1, 2, 3, 4, 5], // weekly
          dateISO: partial.dateISO ?? `${yyyy}-${mm}-${dd}`, // once

          createdAt: Date.now(),
        };

        setAlarms((prev) => [newAlarm, ...prev]);
        return newAlarm;
      },

      toggleAlarm(id) {
        setAlarms((prev) =>
          prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
        );
      },

      updateAlarm(id, patch) {
        setAlarms((prev) =>
          prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
        );
      },

      deleteAlarm(id) {
        setAlarms((prev) => prev.filter((a) => a.id !== id));
      },
    };
  }, [loading]);

  return { alarms, loading, ...actions };
}