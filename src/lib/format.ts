const BKK = "Asia/Bangkok";

export function formatClock(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("th-TH", {
    timeZone: BKK,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDateTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("th-TH", {
    timeZone: BKK,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDuration(totalMin: number) {
  const sign = totalMin < 0 ? "-" : "";
  const min = Math.round(Math.abs(totalMin));
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${sign}${m} นาที`;
  if (m === 0) return `${sign}${h} ชม.`;
  return `${sign}${h} ชม. ${m} นาที`;
}

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

export function todayAt(hours: number, minutes = 0) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BKK,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const y = Number(parts.find((p) => p.type === "year")?.value);
  const mo = Number(parts.find((p) => p.type === "month")?.value);
  const d = Number(parts.find((p) => p.type === "day")?.value);
  // Construct as UTC+7 wall clock
  return new Date(Date.UTC(y, mo - 1, d, hours - 7, minutes, 0));
}
