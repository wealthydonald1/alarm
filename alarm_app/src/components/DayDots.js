import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function DayDots({ active = [] }) {
  return (
    <View style={styles.row}>
      {DAYS.map((d, idx) => {
        const isActive = active.includes(idx);
        return (
          <View
            key={`${d}-${idx}`}
            style={[
              styles.dot,
              isActive ? styles.dotActive : styles.dotInactive,
            ]}
          >
            <Text style={[styles.dotText, isActive ? styles.dotTextActive : styles.dotTextInactive]}>
              {d}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const SIZE = 34;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  dot: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dotActive: {
    backgroundColor: colors.pumpkin,
  },
  dotInactive: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  dotText: {
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  dotTextActive: {
    color: colors.white,
  },
  dotTextInactive: {
    color: "rgba(255,255,255,0.35)",
  },
});