export const currency = new Intl.NumberFormat("ar-YE");
export const dateTime = new Intl.DateTimeFormat("ar-YE", { dateStyle: "medium", timeStyle: "short" });
export const fuelLabels: Record<string, string> = { gasoline: "بنزين", diesel: "ديزل", hybrid: "هايبرد", electric: "كهرباء" };
export const transmissionLabels: Record<string, string> = { automatic: "أوتوماتيك", manual: "عادي" };
export const conditionLabels: Record<string, string> = { new: "جديدة", excellent: "ممتازة", good: "جيدة", fair: "مقبولة", repair_needed: "تحتاج صيانة" };
export const listingStatusLabels: Record<string, string> = { draft: "مسودة", pending: "قيد المراجعة", published: "منشور", rejected: "مرفوض", sold: "مباع", archived: "مؤرشف" };
export const decimalToNumber = (value: unknown) => Number(value ?? 0);
export function auctionTime(endsAt: number) { const ms = endsAt - Date.now(); if (ms <= 0) return "انتهى المزاد"; const hours = Math.floor(ms / 3_600_000); const minutes = Math.floor((ms % 3_600_000) / 60_000); return hours > 24 ? `ينتهي بعد ${Math.ceil(hours / 24)} يوم` : `ينتهي خلال ${hours}س ${minutes}د`; }

export type AuctionTimingStatus = "scheduled" | "live" | "ended" | "cancelled";
type AuctionTimeValue = Date | number | string | null | undefined;

function toMilliseconds(value: AuctionTimeValue) {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value === "string") return new Date(value).getTime();
  return Number.NaN;
}

export function formatAuctionCountdown(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return days > 0 ? `${days}ي ${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function getAuctionTimingInfo(input: { startsAt?: AuctionTimeValue; endsAt?: AuctionTimeValue; status?: string | null; now?: number }) {
  const now = input.now ?? Date.now();
  const startsAt = toMilliseconds(input.startsAt);
  const endsAt = toMilliseconds(input.endsAt);
  if (input.status === "cancelled") return { state: "cancelled" as const, label: "ألغي المزاد", detail: "هذا المزاد غير متاح للمزايدة", remainingMs: 0 };
  if (input.status === "ended" || (Number.isFinite(endsAt) && endsAt <= now)) return { state: "ended" as const, label: "انتهى المزاد", detail: "أُغلق وقت المزايدة", remainingMs: 0 };
  if (Number.isFinite(startsAt) && startsAt > now) {
    const remainingMs = startsAt - now;
    return { state: "scheduled" as const, label: "يبدأ خلال", detail: formatAuctionCountdown(remainingMs), remainingMs };
  }
  if (Number.isFinite(endsAt)) {
    const remainingMs = Math.max(0, endsAt - now);
    return { state: "live" as const, label: "ينتهي خلال", detail: formatAuctionCountdown(remainingMs), remainingMs };
  }
  return { state: "live" as const, label: "مزاد مباشر", detail: "الوقت قيد التحديث", remainingMs: 0 };
}
