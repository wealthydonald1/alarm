import React from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

function DayMiniRow({ active = [] }) {
  const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
  return (
    <View style={stylesMini.row}>
      {DAYS.map((d, idx) => {
        const isActive = active.includes(idx);
        return (
          <View
            key={`${d}-${idx}`}
            style={[
              stylesMini.dot,
              isActive ? stylesMini.dotActive : stylesMini.dotInactive,
            ]}
          >
            <Text style={[stylesMini.text, isActive ? stylesMini.textActive : stylesMini.textInactive]}>
              {d}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function AlarmCard({
  label,
  time,
  ampm,
  enabled,
  inText,
  daysActive = [],
  onToggle,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{label.toUpperCase()}</Text>
        </View>

        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: "rgba(35,61,77,0.10)", true: colors.pumpkin }}
          thumbColor={colors.white}
        />
      </View>

      <View style={styles.timeRow}>
        <Text style={[styles.time, !enabled && styles.disabled]}>{time}</Text>
        <Text style={[styles.ampm, !enabled && styles.disabled]}>{ampm}</Text>
      </View>

      <View style={{ height: spacing.md }} />

      <DayMiniRow active={daysActive} />

      <View style={{ height: spacing.sm }} />

      <Text style={[styles.inText, !enabled && styles.disabled]}>{inText}</Text>
    </View>
  );
}

const stylesMini = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, alignItems: "center" },
  dot: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  dotActive: { backgroundColor: colors.pumpkin },
  dotInactive: { backgroundColor: "transparent" },
  text: { fontSize: 12, fontWeight: "700" },
  textActive: { color: colors.white },
  textInactive: { color: "rgba(35,61,77,0.35)" },
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    color: colors.muted,
    fontWeight: "800",
    letterSpacing: 1,
    fontSize: 12,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginTop: 8,
  },
  time: {
    fontSize: 42,
    fontWeight: "800",
    color: colors.charcoal,
  },
  ampm: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.charcoal,
    paddingBottom: 8,
  },
  inText: {
    color: colors.muted,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.35,
  },
});