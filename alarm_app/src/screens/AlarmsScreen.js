import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import DayDots from "../components/DayDots";
import AlarmCard from "../components/AlarmCard";
import EditAlarmModal from "../components/EditAlarmModal";
import { useAlarms } from "../alarms/useAlarms";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function hhmmTo12h(hhmm) {
  const [hStr, mStr] = hhmm.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return { time: `${pad2(h12)}:${pad2(m)}`, ampm };
}

// Returns next occurrence Date for an alarm or null
function nextOccurrence(alarm, now = new Date()) {
  if (!alarm.enabled) return null;

  const [hh, mm] = alarm.time.split(":").map((x) => parseInt(x, 10));
  const base = new Date(now);
  base.setSeconds(0);
  base.setMilliseconds(0);

  if (alarm.repeatType === "once") {
    if (!alarm.dateISO) return null;
    const d = new Date(`${alarm.dateISO}T00:00:00`);
    d.setHours(hh);
    d.setMinutes(mm);

    // if it's in the past, it's not "next"
    if (d.getTime() <= now.getTime()) return null;
    return d;
  }

  // weekly
  const days = Array.isArray(alarm.daysActive) ? alarm.daysActive : [];
  if (days.length === 0) return null;

  // try today + next 6 days
  for (let add = 0; add < 7; add++) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + add);
    candidate.setHours(hh);
    candidate.setMinutes(mm);
    candidate.setSeconds(0);
    candidate.setMilliseconds(0);

    const dow = candidate.getDay(); // 0..6
    const okDay = days.includes(dow);
    const inFuture = candidate.getTime() > now.getTime();

    if (okDay && inFuture) return candidate;
  }

  return null;
}

function findNextEnabledAlarm(alarms) {
  const now = new Date();
  let best = null;
  let bestDate = null;

  for (const a of alarms) {
    const d = nextOccurrence(a, now);
    if (!d) continue;
    if (!bestDate || d.getTime() < bestDate.getTime()) {
      best = a;
      bestDate = d;
    }
  }

  return best && bestDate ? { alarm: best, date: bestDate } : null;
}

function timeUntilText(targetDate) {
  const ms = targetDate.getTime() - Date.now();
  if (ms <= 0) return "Now";

  const totalMin = Math.floor(ms / 60000);
  const days = Math.floor(totalMin / (60 * 24));
  const hours = Math.floor((totalMin % (60 * 24)) / 60);
  const mins = totalMin % 60;

  if (days > 0) return `In ${days}d ${hours}h`;
  if (hours > 0) return `In ${hours}h ${mins}m`;
  return `In ${mins}m`;
}

export default function AlarmsScreen() {
  const { alarms, loading, addAlarm, updateAlarm, deleteAlarm, toggleAlarm } =
    useAlarms();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [selectedAlarm, setSelectedAlarm] = useState(null);

  const next = useMemo(() => {
    if (loading) return null;
    return findNextEnabledAlarm(alarms);
  }, [alarms, loading]);

  const hero = useMemo(() => {
    if (!next) {
      return {
        label: "No alarms",
        time: "— — : — —",
        ampm: "",
        daysActive: [],
        inText: "Tap + to add one",
      };
    }

    const { alarm, date } = next;
    const display = hhmmTo12h(alarm.time);

    return {
      label: alarm.label || "Alarm",
      time: display.time,
      ampm: display.ampm,
      daysActive: alarm.repeatType === "weekly" ? alarm.daysActive || [] : [],
      inText: timeUntilText(date),
    };
  }, [next]);

  function openCreate() {
    setModalMode("create");
    setSelectedAlarm(null);
    setModalVisible(true);
  }

  function openEdit(alarm) {
    setModalMode("edit");
    setSelectedAlarm(alarm);
    setModalVisible(true);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alarms</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.heroCircle} />

          <View style={styles.heroTopRow}>
            <Text style={styles.heroKicker}>
              NEXT ALARM • {hero.label.toUpperCase()}
            </Text>
          </View>

          <View style={styles.heroTimeRow}>
            <Text style={styles.heroTime}>{hero.time}</Text>
            {!!hero.ampm && <Text style={styles.heroAmPm}>{hero.ampm}</Text>}
          </View>

          <View style={{ height: spacing.md }} />

          <DayDots active={hero.daysActive} />

          <View style={{ height: spacing.md }} />

          <Text style={styles.heroInText}>{hero.inText}</Text>
        </View>

        <Text style={styles.sectionTitle}>ALL ALARMS</Text>
        <View style={{ height: spacing.sm }} />

        <View style={styles.listWrap}>
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>Loading alarms…</Text>
            </View>
          ) : alarms.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No alarms yet</Text>
              <Text style={styles.emptySub}>
                Tap the + button to create your first alarm.
              </Text>
            </View>
          ) : (
            <View style={styles.listGap}>
              {alarms.map((a) => {
                const display = hhmmTo12h(a.time);
                const inText =
                  a.repeatType === "once"
                    ? `Once • ${a.dateISO ?? ""}`
                    : "Weekly";

                return (
                  <AlarmCard
                    key={a.id}
                    label={a.label}
                    time={display.time}
                    ampm={display.ampm}
                    enabled={a.enabled}
                    inText={inText}
                    daysActive={a.repeatType === "weekly" ? a.daysActive : []}
                    onToggle={() => toggleAlarm(a.id)}
                    onPress={() => openEdit(a)}
                  />
                );
              })}
            </View>
          )}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* FAB */}
      <Pressable style={styles.fab} onPress={openCreate}>
        <Text style={styles.fabPlus}>+</Text>
      </Pressable>

      {/* MODAL */}
      <EditAlarmModal
        visible={modalVisible}
        mode={modalMode}
        initialAlarm={selectedAlarm}
        onClose={() => setModalVisible(false)}
        onSave={(payload) => {
          if (modalMode === "create") {
            addAlarm(payload);
          } else if (selectedAlarm) {
            updateAlarm(selectedAlarm.id, payload);
          }
          setModalVisible(false);
        }}
        onDelete={() => {
          if (selectedAlarm) deleteAlarm(selectedAlarm.id);
          setModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: {
    backgroundColor: colors.white,
    paddingTop: spacing.md,
    paddingBottom: 12,
    paddingHorizontal: spacing.lg,
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.02)",
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: colors.charcoal },

  content: { paddingTop: 0, paddingBottom: spacing.lg },

  hero: {
    backgroundColor: colors.charcoal,
    padding: spacing.lg,
    marginTop: 0,
    borderRadius: 0,
    overflow: "hidden",
  },
  heroCircle: {
    position: "absolute",
    right: -40,
    bottom: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroKicker: {
    color: colors.pumpkin,
    fontWeight: "900",
    letterSpacing: 1.5,
    fontSize: 12,
  },
  heroTimeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginTop: spacing.md,
  },
  heroTime: { color: colors.white, fontSize: 82, fontWeight: "900", letterSpacing: -3 },
  heroAmPm: { color: colors.white, fontSize: 22, fontWeight: "900", paddingBottom: 20, opacity: 0.95 },
  heroInText: { color: colors.pumpkin, fontWeight: "700", fontSize: 16 },

  sectionTitle: {
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    color: "rgba(35,61,77,0.32)",
    fontWeight: "900",
    letterSpacing: 1.6,
    fontSize: 11,
  },

  listWrap: { marginHorizontal: 12 },
  listGap: { gap: spacing.md },

  loadingWrap: { paddingVertical: 24, alignItems: "center", gap: 10 },
  loadingText: { color: colors.muted, fontWeight: "600" },

  emptyWrap: { paddingVertical: 28, alignItems: "center", gap: 6 },
  emptyTitle: { color: colors.charcoal, fontWeight: "800", fontSize: 16 },
  emptySub: { color: colors.muted, fontWeight: "600", textAlign: "center" },

  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.pumpkin,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  fabPlus: { color: colors.white, fontSize: 34, fontWeight: "800", marginTop: -1 },
});