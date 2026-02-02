function parseHHMM(hhmm) {
  const [hh, mm] = (hhmm || "00:00").split(":").map((x) => parseInt(x, 10));
  return { hh: hh || 0, mm: mm || 0 };
}

export function nextOccurrenceDate(alarm, now = new Date()) {
  if (!alarm?.enabled) return null;

  const { hh, mm } = parseHHMM(alarm.time);
  const nowMs = now.getTime();

  if (alarm.repeatType === "once") {
    if (!alarm.dateISO) return null;
    const d = new Date(`${alarm.dateISO}T00:00:00`);
    d.setHours(hh, mm, 0, 0);
    if (d.getTime() <= nowMs) return null;
    return d;
  }

  // weekly
  const days = Array.isArray(alarm.daysActive) ? alarm.daysActive : [];
  if (days.length === 0) return null;

  for (let add = 0; add < 7; add++) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + add);
    candidate.setHours(hh, mm, 0, 0);

    const dow = candidate.getDay(); // 0..6
    const okDay = days.includes(dow);
    const inFuture = candidate.getTime() > nowMs;

    if (okDay && inFuture) return candidate;
  }

  return null;
}

export function hhmmTo12h(hhmm) {
  const [hStr, mStr] = (hhmm || "00:00").split(":");
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;

  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;

  const pad2 = (n) => String(n).padStart(2, "0");
  return { time: `${pad2(h12)}:${pad2(m)}`, ampm };
}