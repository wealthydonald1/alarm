import React, { useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

const DAYS = [
  { label: "S", idx: 0 },
  { label: "M", idx: 1 },
  { label: "T", idx: 2 },
  { label: "W", idx: 3 },
  { label: "T", idx: 4 },
  { label: "F", idx: 5 },
  { label: "S", idx: 6 },
];

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toHHMM(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function parseHHMM(hhmm) {
  const [h, m] = hhmm.split(":").map((x) => parseInt(x, 10));
  const d = new Date();
  d.setHours(h || 0);
  d.setMinutes(m || 0);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
}

function to12h(hhmm) {
  const [hStr, mStr] = hhmm.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return { time: `${pad2(h12)}:${pad2(m)}`, ampm };
}

function formatDateISO(dateISO) {
  // simple display "YYYY-MM-DD"
  return dateISO;
}

export default function EditAlarmModal({
  visible,
  mode, // "create" | "edit"
  initialAlarm,
  onClose,
  onSave,
  onDelete, // only in edit
}) {
  const defaultAlarm = useMemo(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = pad2(now.getMonth() + 1);
    const dd = pad2(now.getDate());

    return {
      label: "Alarm",
      enabled: true,
      time: "07:00",
      repeatType: "weekly",
      daysActive: [1, 2, 3, 4, 5],
      dateISO: `${yyyy}-${mm}-${dd}`,
    };
  }, []);

  const alarm = initialAlarm ?? defaultAlarm;

  const [label, setLabel] = useState(alarm.label ?? "Alarm");
  const [repeatType, setRepeatType] = useState(alarm.repeatType ?? "weekly");
  const [daysActive, setDaysActive] = useState(alarm.daysActive ?? [1, 2, 3, 4, 5]);
  const [dateISO, setDateISO] = useState(alarm.dateISO ?? defaultAlarm.dateISO);

  const [timeDate, setTimeDate] = useState(parseHHMM(alarm.time ?? "07:00"));
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const timeDisplay = to12h(toHHMM(timeDate));

  function toggleDay(idx) {
    setDaysActive((prev) =>
      prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx].sort()
    );
  }

  function save() {
    const payload = {
      label: label.trim() || "Alarm",
      time: toHHMM(timeDate),
      repeatType,
      daysActive: repeatType === "weekly" ? daysActive : [],
      dateISO: repeatType === "once" ? dateISO : null,
      enabled: true, // when saved, keep enabled on (you can change later)
    };
    onSave(payload);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.topRow}>
            <Text style={styles.title}>
              {mode === "create" ? "New alarm" : "Edit alarm"}
            </Text>

            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          {/* Label */}
          <Text style={styles.label}>NAME</Text>
          <TextInput
            value={label}
            onChangeText={setLabel}
            placeholder="Alarm name"
            placeholderTextColor="rgba(35,61,77,0.35)"
            style={styles.input}
          />

          {/* Time */}
          <Text style={[styles.label, { marginTop: spacing.lg }]}>TIME</Text>
          <Pressable
            style={styles.pickerRow}
            onPress={() => setShowTimePicker(true)}
            android_ripple={{ color: "rgba(0,0,0,0.06)" }}
          >
            <Text style={styles.bigTime}>{timeDisplay.time}</Text>
            <Text style={styles.ampm}>{timeDisplay.ampm}</Text>
            <View style={{ flex: 1 }} />
            <Text style={styles.change}>Change</Text>
          </Pressable>

          {/* Repeat */}
          <Text style={[styles.label, { marginTop: spacing.lg }]}>REPEAT</Text>
          <View style={styles.segment}>
            <Pressable
              style={[styles.segmentBtn, repeatType === "once" && styles.segmentBtnActive]}
              onPress={() => setRepeatType("once")}
              android_ripple={{ color: "rgba(0,0,0,0.06)" }}
            >
              <Text style={[styles.segmentText, repeatType === "once" && styles.segmentTextActive]}>
                Once
              </Text>
            </Pressable>

            <Pressable
              style={[styles.segmentBtn, repeatType === "weekly" && styles.segmentBtnActive]}
              onPress={() => setRepeatType("weekly")}
              android_ripple={{ color: "rgba(0,0,0,0.06)" }}
            >
              <Text style={[styles.segmentText, repeatType === "weekly" && styles.segmentTextActive]}>
                Weekly
              </Text>
            </Pressable>
          </View>

          {/* Once date */}
          {repeatType === "once" ? (
            <>
              <Text style={[styles.label, { marginTop: spacing.md }]}>DATE</Text>
              <Pressable
                style={styles.dateRow}
                onPress={() => setShowDatePicker(true)}
                android_ripple={{ color: "rgba(0,0,0,0.06)" }}
              >
                <Text style={styles.dateText}>{formatDateISO(dateISO)}</Text>
                <View style={{ flex: 1 }} />
                <Text style={styles.change}>Change</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={[styles.label, { marginTop: spacing.md }]}>DAYS</Text>
              <View style={styles.daysRow}>
                {DAYS.map((d) => {
                  const active = daysActive.includes(d.idx);
                  return (
                    <Pressable
                      key={d.idx}
                      onPress={() => toggleDay(d.idx)}
                      style={[styles.dayChip, active && styles.dayChipActive]}
                      android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: true }}
                    >
                      <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>
                        {d.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            {mode === "edit" ? (
              <Pressable
                style={styles.deleteBtn}
                onPress={onDelete}
                android_ripple={{ color: "rgba(255,255,255,0.12)" }}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            ) : (
              <View />
            )}

            <Pressable
              style={styles.saveBtn}
              onPress={save}
              android_ripple={{ color: "rgba(255,255,255,0.12)" }}
            >
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>

          {/* Native pickers */}
          {showTimePicker && (
            <DateTimePicker
              value={timeDate}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selected) => {
                setShowTimePicker(false);
                if (selected) setTimeDate(selected);
              }}
            />
          )}

          {showDatePicker && (
            <DateTimePicker
              value={new Date(`${dateISO}T00:00:00`)}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selected) => {
                setShowDatePicker(false);
                if (!selected) return;
                const yyyy = selected.getFullYear();
                const mm = pad2(selected.getMonth() + 1);
                const dd = pad2(selected.getDate());
                setDateISO(`${yyyy}-${mm}-${dd}`);
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.charcoal,
  },
  close: {
    fontSize: 18,
    color: colors.charcoal,
    opacity: 0.7,
  },
  label: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
    color: "rgba(35,61,77,0.35)",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(35,61,77,0.12)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontWeight: "700",
    color: colors.charcoal,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderWidth: 1,
    borderColor: "rgba(35,61,77,0.12)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  bigTime: {
    fontSize: 34,
    fontWeight: "900",
    color: colors.charcoal,
    letterSpacing: -1,
  },
  ampm: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.charcoal,
    paddingBottom: 6,
    marginLeft: 8,
  },
  change: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.pumpkin,
  },
  segment: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "rgba(35,61,77,0.12)",
    borderRadius: 16,
    overflow: "hidden",
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  segmentBtnActive: {
    backgroundColor: "rgba(254,127,45,0.12)",
  },
  segmentText: {
    fontWeight: "900",
    color: "rgba(35,61,77,0.65)",
  },
  segmentTextActive: {
    color: colors.pumpkin,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(35,61,77,0.12)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dateText: {
    fontWeight: "900",
    color: colors.charcoal,
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  dayChip: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(35,61,77,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  dayChipActive: {
    backgroundColor: colors.pumpkin,
    borderColor: colors.pumpkin,
  },
  dayChipText: {
    fontWeight: "900",
    color: "rgba(35,61,77,0.55)",
  },
  dayChipTextActive: {
    color: colors.white,
  },
  actions: {
    marginTop: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deleteBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "rgba(35,61,77,0.10)",
  },
  deleteText: {
    fontWeight: "900",
    color: colors.charcoal,
  },
  saveBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: colors.pumpkin,
  },
  saveText: {
    fontWeight: "900",
    color: colors.white,
  },
});