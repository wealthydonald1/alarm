import React from "react";
import { View, Text, StyleSheet, Switch, Pressable } from "react-native";
import { colors } from "../theme/colors";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

function DayMiniRow({ active = [], enabled }) {
  return (
    <View style={styles.dayRow}>
      {DAYS.map((d, idx) => {
        const isActive = active.includes(idx);
        return (
          <View
            key={`${d}-${idx}`}
            style={[
              styles.dayDot,
              isActive && enabled && styles.dayDotActive,
            ]}
          >
            <Text
              style={[
                styles.dayText,
                isActive && enabled
                  ? styles.dayTextActive
                  : styles.dayTextInactive,
              ]}
            >
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
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(0,0,0,0.06)" }}
      style={({ pressed }) => [
        styles.card,
        !enabled && styles.cardDisabled,
        pressed && { transform: [{ scale: 0.995 }] },
      ]}
    >
      <View style={styles.topRow}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>

        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{
            false: "rgba(35,61,77,0.12)",
            true: colors.pumpkin,
          }}
          thumbColor={colors.white}
        />
      </View>

      <View style={styles.timeRow}>
        <Text style={styles.time}>{time}</Text>
        <Text style={styles.ampm}>{ampm}</Text>
      </View>

      <DayMiniRow active={daysActive} enabled={enabled} />

      <Text style={styles.inText}>{inText}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 22,
    minHeight: 160,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  cardDisabled: {
    opacity: 0.45,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  label: {
    color: colors.muted,
    fontWeight: "800",
    letterSpacing: 1.2,
    fontSize: 12,
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 10,
    marginBottom: 18,
  },

  time: {
    fontSize: 46,
    fontWeight: "800",
    color: colors.charcoal,
    letterSpacing: -1.5,
  },

  ampm: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.charcoal,
    marginLeft: 8,
    paddingBottom: 8,
  },

  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  dayDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  dayDotActive: {
    backgroundColor: colors.pumpkin,
  },

  dayText: {
    fontSize: 12,
    fontWeight: "700",
  },

  dayTextActive: {
    color: colors.white,
  },

  dayTextInactive: {
    color: "rgba(35,61,77,0.35)",
  },

  inText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
  },
});