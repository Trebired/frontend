const DAY_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/u;
const DAYS_PER_WEEK = 7;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function dayKeyOf(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDayKey(key: unknown) {
  const match = DAY_KEY_PATTERN.exec(String(key || ""));
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return dayKeyOf(date) === match[0] ? date : null;
}

function isDayKey(key: unknown): key is string {
  return parseDayKey(key) != null;
}

function todayKey() {
  return dayKeyOf(new Date());
}

function addDays(key: string, days: number) {
  const date = parseDayKey(key) || new Date();
  return dayKeyOf(new Date(date.getFullYear(), date.getMonth(), date.getDate() + days));
}

function addMonths(key: string, months: number) {
  const date = parseDayKey(key) || new Date();
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return dayKeyOf(new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay)));
}

function monthKey(key: string) {
  return `${key.slice(0, 7)}-01`;
}

function sameMonth(left: string, right: string) {
  return left.slice(0, 7) === right.slice(0, 7);
}

function clampDayKey(key: string, min?: string | null, max?: string | null) {
  if (min && isDayKey(min) && key < min) return min;
  if (max && isDayKey(max) && key > max) return max;
  return key;
}

function weekStartDay(lang?: string) {
  try {
    const locale: any = new Intl.Locale(lang || (typeof navigator === "object" ? navigator.language : "") || "en");
    const info = typeof locale.getWeekInfo === "function" ? locale.getWeekInfo() : locale.weekInfo;
    const first = Number(info && info.firstDay);
    if (first >= 1 && first <= 7) return first % DAYS_PER_WEEK;
  } catch {}
  return /^en-US$/iu.test(String(lang || "")) ? 0 : 1;
}

function weekStartOf(key: string, firstDay: number) {
  const date = parseDayKey(key) || new Date();
  return addDays(key, -((date.getDay() - firstDay + DAYS_PER_WEEK) % DAYS_PER_WEEK));
}

function monthWeeks(viewKey: string, firstDay: number) {
  const first = monthKey(viewKey);
  let cursor = weekStartOf(first, firstDay);
  const weeks: string[][] = [];
  while (weeks.length < 6 && (weeks.length === 0 || sameMonth(cursor, first))) {
    const week = Array.from({ length: DAYS_PER_WEEK }, (_, index) => addDays(cursor, index));
    weeks.push(week);
    cursor = addDays(cursor, DAYS_PER_WEEK);
  }
  return weeks;
}

function formatter(lang: string | undefined, options: Intl.DateTimeFormatOptions) {
  try {
    return new Intl.DateTimeFormat(lang || undefined, options);
  } catch {
    return new Intl.DateTimeFormat(undefined, options);
  }
}

function formatDayKey(key: string, lang?: string, options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) {
  const date = parseDayKey(key);
  return date ? formatter(lang, options).format(date) : "";
}

function monthTitle(key: string, lang?: string) {
  return formatDayKey(monthKey(key), lang, { month: "long", year: "numeric" });
}

function weekdayLabels(lang: string | undefined, firstDay: number) {
  const sunday = new Date(2024, 0, 7);
  return Array.from({ length: DAYS_PER_WEEK }, (_, index) => {
      const date = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + ((firstDay + index) % DAYS_PER_WEEK));
      return {
        long: formatter(lang, { weekday: "long" }).format(date),
        short: formatter(lang, { weekday: "narrow" }).format(date),
      };
  });
}

function dayStartTime(key: string) {
  const date = parseDayKey(key);
  return date ? date.getTime() : NaN;
}

function dayKeyOfTime(time: number) {
  return dayKeyOf(new Date(time));
}

export {
  addDays,
  addMonths,
  clampDayKey,
  dayKeyOf,
  dayKeyOfTime,
  dayStartTime,
  formatDayKey,
  isDayKey,
  monthKey,
  monthTitle,
  monthWeeks,
  parseDayKey,
  sameMonth,
  todayKey,
  weekdayLabels,
  weekStartDay,
  weekStartOf,
};
