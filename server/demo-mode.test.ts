import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { demoListingDetail, demoPublicListings, isDemoAuctionId, isDemoListingId } from "./demoListings";
import type { TrpcContext } from "./_core/context";

function context(): TrpcContext { const now = new Date(); return { user: { id: 7, openId: "demo-test", name: "Tester", email: "test@example.com", phone: null, avatarUrl: null, loginMethod: "test", role: "user", status: "active", createdAt: now, updatedAt: now, lastSignedIn: now }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] }; }

describe("development demo mode", () => {
  it("يعرض بيانات معاينة موسومة وغير مرتبطة بقاعدة البيانات", () => {
    const items = demoPublicListings({ page: 1, pageSize: 10 });
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.listing.isDemo && item.listing.title.includes("تجريبي — غير متاح للبيع"))).toBe(true);
    expect(demoListingDetail(990001)?.isDemo).toBe(true);
  });

  it("يطابق بيانات المعاينة البحث والفلاتر ولا يعرض بيعًا حقيقيًا", () => {
    const auctions = demoPublicListings({ saleType: "auction", page: 1, pageSize: 10 });
    expect(auctions.every((item) => item.listing.saleType === "auction")).toBe(true);
    expect(isDemoListingId(990002)).toBe(true);
    expect(isDemoAuctionId(999001)).toBe(true);
  });

  it("يعطّل بيانات المعاينة بالكامل في وضع الإنتاج", () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    expect(demoPublicListings({ page: 1, pageSize: 10 })).toEqual([]);
    expect(demoListingDetail(990001)).toBeNull();
    process.env.NODE_ENV = previous;
  });

  it("يرفض الحفظ والمزايدة والمراسلة على أي بيانات معاينة", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.marketplace.listings.toggleFavorite({ listingId: 990001 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.marketplace.auctions.placeBid({ auctionId: 999001, amount: 20000000 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.marketplace.messages.open({ listingId: 990001 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
