import { describe, expect, it } from "vitest";
import { isValidBidAmount, listingBusinessError, listingInput, messageRecipient } from "./routers/marketplace";
import { shouldSendAuctionReminder } from "./auctionReminderRules";

const validListing = {
  title: "تويوتا كامري فل أوبشن 2022",
  description: "سيارة بحالة ممتازة، تمت صيانتها بانتظام مع جميع الأوراق والمفاتيح الأصلية.",
  make: "تويوتا", model: "كامري", year: 2022, mileage: 42000,
  fuelType: "gasoline" as const, transmission: "automatic" as const, bodyType: "سيدان",
  condition: "excellent" as const, city: "صنعاء", contactPhone: "777123456",
  showWhatsapp: false, allowNegotiation: true, saleType: "sale" as const, askingPrice: 25000000,
};

describe("marketplace validation", () => {
  it("يرفض حقول الإعلان غير المكتملة من طبقة التحقق", () => {
    expect(listingInput.safeParse({ ...validListing, title: "قصير" }).success).toBe(false);
  });

  it("يفرض السعر في البيع المباشر ووقتًا صحيحًا للمزاد", () => {
    const now = 1_800_000_000_000;
    expect(listingBusinessError({ ...validListing, askingPrice: undefined }, now)).toContain("السعر المطلوب");
    expect(listingBusinessError({ ...validListing, saleType: "auction", askingPrice: undefined, auction: { startPrice: 1000, minimumIncrement: 100, startsAt: now, endsAt: now } }, now)).toContain("المزاد");
  });

  it("لا يقبل مزايدة أقل من المبلغ الحالي زائد الزيادة الدنيا", () => {
    expect(isValidBidAmount(10000, 500, 10499)).toBe(false);
    expect(isValidBidAmount(10000, 500, 10500)).toBe(true);
  });

  it("يوجه إشعار الرسالة إلى الطرف الآخر فقط", () => {
    expect(messageRecipient(10, 20, 10)).toBe(20);
    expect(messageRecipient(10, 20, 20)).toBe(10);
  });

  it("يرسل تذكير المزاد فقط ضمن النافذة الزمنية ولمرة واحدة", () => {
    const now = 1_800_000_000_000;
    expect(shouldSendAuctionReminder({ status: "live", endsAt: now + 20 * 60 * 1000, reminderSentAt: null }, now)).toBe(true);
    expect(shouldSendAuctionReminder({ status: "live", endsAt: now + 40 * 60 * 1000, reminderSentAt: null }, now)).toBe(false);
    expect(shouldSendAuctionReminder({ status: "live", endsAt: now + 20 * 60 * 1000, reminderSentAt: now - 1 }, now)).toBe(false);
  });
});
