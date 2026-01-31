import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@alarms_v1";

export async function loadAlarms() {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function saveAlarms(alarms) {
  await AsyncStorage.setItem(KEY, JSON.stringify(alarms));
}