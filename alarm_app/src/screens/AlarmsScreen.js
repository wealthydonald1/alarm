import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Pressable,
} from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import DayDots from "../components/DayDots";
import AlarmCard from "../components/AlarmCard";

export default function AlarmsScreen() {
  // UI-only mock state (we’ll replace with storage later)
  const [nextEnabled, setNextEnabled] = useState(true);

  const [alarms, setAlarms] = useState([
    {
      id: "1",
      label: "Gym",
      time: "06:30",
      ampm: "AM",
      enabled: false,
      daysActive: [],
      inText: "In 22h 50m",
    },
    {
      id: "2",
      label: "Medication",
      time: "09:00",
      ampm: "PM",
      enabled: true,
      daysActive: [0, 1, 2, 3, 4, 5, 6],
      inText: "In 14h 20m",
    },
    {
      id: "3",
      label: "Weekly Call",
      time: "11:15",
      ampm: "AM",
      enabled: true,
      daysActive: [5],
      inText: "In 3d 4h",
    },
  ]);

  const nextAlarm = useMemo(
    () => ({
      label: "Wake up",
      time: "07:00",
      ampm: "AM",
      daysActive: [1, 2, 3, 4, 5], // M-F (indexes: 1..5)
      inText: "In 8h 20m",
    }),
    []
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alarms</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO / NEXT ALARM (FULL WIDTH) */}
        <View style={styles.hero}>
          {/* subtle circle decoration */}
          <View style={styles.heroCircle} />

          <View style={styles.heroTopRow}>
            <Text style={styles.heroKicker}>
              NEXT ALARM • {nextAlarm.label.toUpperCase()}
            </Text>

            <Switch
              value={nextEnabled}
              onValueChange={setNextEnabled}
              trackColor={{
                false: "rgba(255,255,255,0.22)",
                true: colors.pumpkin,
              }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.heroTimeRow}>
            <Text style={styles.heroTime}>{nextAlarm.time}</Text>
            <Text style={styles.heroAmPm}>{nextAlarm.ampm}</Text>
          </View>

          <View style={{ height: spacing.md }} />

          <DayDots active={nextAlarm.daysActive} />

          <View style={{ height: spacing.md }} />

          <Text style={styles.heroInText}>{nextAlarm.inText}</Text>
        </View>

        {/* ALL ALARMS */}
        <Text style={styles.sectionTitle}>ALL ALARMS</Text>

        <View style={{ height: spacing.md }} />

        <View style={styles.listWrap}>
          <View style={styles.listGap}>
            {alarms.map((a) => (
              <AlarmCard
                key={a.id}
                label={a.label}
                time={a.time}
                ampm={a.ampm}
                enabled={a.enabled}
                inText={a.inText}
                daysActive={a.daysActive}
                onToggle={() => {
                  setAlarms((prev) =>
                    prev.map((x) =>
                      x.id === a.id ? { ...x, enabled: !x.enabled } : x
                    )
                  );
                }}
              />
            ))}
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => console.log("Add new")}>
        <Text style={styles.fabPlus}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.charcoal,
  },

  // No horizontal padding here so hero can be full width.
  content: {
    paddingBottom: spacing.lg,
  },

  // FULL-WIDTH HERO
  hero: {
    backgroundColor: colors.charcoal,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  heroCircle: {
    position: "absolute",
    right: -40,
    bottom: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
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
  heroTime: {
    color: colors.white,
    fontSize: 82,
    fontWeight: "900",
    letterSpacing: -3,
  },
  heroAmPm: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "900",
    paddingBottom: 20,
    opacity: 0.95,
  },
  heroInText: {
    color: colors.pumpkin,
    fontWeight: "700",
    fontSize: 16,
  },

  sectionTitle: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    color: "rgba(35,61,77,0.35)",
    fontWeight: "900",
    letterSpacing: 1.5,
    fontSize: 12,
  },

  // Cards get the horizontal padding (not the whole ScrollView)
  listWrap: {
    marginHorizontal: spacing.lg,
  },
  listGap: {
    gap: spacing.lg,
  },

  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.xl,
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.pumpkin,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },
  fabPlus: {
    color: colors.white,
    fontSize: 40,
    fontWeight: "800",
    marginTop: -2,
  },
});