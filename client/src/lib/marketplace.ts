export const currency = new Intl.NumberFormat("ar-YE");
export const dateTime = new Intl.DateTimeFormat("ar-YE", { dateStyle: "medium", timeStyle: "short" });
export const fuelLabels: Record<string, string> = { gasoline: "بنزين", diesel: "ديزل", hybrid: "هايبرد", electric: "كهرباء" };
export const transmissionLabels: Record<string, string> = { automatic: "أوتوماتيك", manual: "عادي" };
export const conditionLabels: Record<string, string> = { new: "جديدة", excellent: "ممتازة", good: "جيدة", fair: "مقبولة", repair_needed: "تحتاج صيانة" };
export const listingStatusLabels: Record<string, string> = { draft: "مسودة", pending: "قيد المراجعة", published: "منشور", rejected: "مرفوض", sold: "مباع", archived: "مؤرشف" };
export const decimalToNumber = (value: unknown) => Number(value ?? 0);
export function auctionTime(endsAt: number) { const ms = endsAt - Date.now(); if (ms <= 0) return "انتهى المزاد"; const hours = Math.floor(ms / 3_600_000); const minutes = Math.floor((ms % 3_600_000) / 60_000); return hours > 24 ? `ينتهي بعد ${Math.ceil(hours / 24)} يوم` : `ينتهي خلال ${hours}س ${minutes}د`; }
