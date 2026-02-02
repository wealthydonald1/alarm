import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export default function RingScreen({
  alarm,
  onSnooze,
  onDismiss,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{alarm?.label || "Alarm"}</Text>

      <Text style={styles.time}>{alarm?.displayTime || "00:00"}</Text>

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
  label: {
    color: colors.pumpkin,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: spacing.md,
  },
  time: {
    color: colors.white,
    fontSize: 64,
    fontWeight: "900",
    marginBottom: spacing.xl,
  },
  buttons: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  snoozeBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
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