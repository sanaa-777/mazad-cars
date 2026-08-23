import { describe, expect, it } from "vitest";
import { formatAuctionCountdown, getAuctionTimingInfo } from "../client/src/lib/marketplace";

describe("auction timing", () => {
  const now = 1_800_000_000_000;

  it("يعرض وقت البدء للمزاد المجدول قبل بدئه", () => {
    expect(getAuctionTimingInfo({ startsAt: now + 3_661_000, endsAt: now + 10_000_000, status: "scheduled", now })).toMatchObject({ state: "scheduled", label: "يبدأ خلال", detail: "01:01:01" });
  });

  it("يعرض الوقت المتبقي للمزاد المباشر", () => {
    expect(getAuctionTimingInfo({ startsAt: now - 1, endsAt: now + 125_000, status: "live", now })).toMatchObject({ state: "live", label: "ينتهي خلال", detail: "00:02:05" });
  });

  it("يحسم حالات المنتهي والملغي من بيانات الوقت والحالة", () => {
    expect(getAuctionTimingInfo({ endsAt: now - 1, status: "live", now }).state).toBe("ended");
    expect(getAuctionTimingInfo({ endsAt: now + 1, status: "cancelled", now }).state).toBe("cancelled");
    expect(formatAuctionCountdown(86_401_000)).toBe("1ي 00:00:01");
  });
});
