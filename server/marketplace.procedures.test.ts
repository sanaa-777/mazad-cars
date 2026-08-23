import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, getDb: vi.fn(), syncAuctionStatuses: vi.fn(), createNotification: vi.fn(), addAudit: vi.fn(), ownedListing: vi.fn() };
});

import { appRouter } from "./routers";
import { addAudit, createNotification, getDb, ownedListing, syncAuctionStatuses } from "./db";

const getDbMock = vi.mocked(getDb); const notifyMock = vi.mocked(createNotification); const auditMock = vi.mocked(addAudit); const ownedListingMock = vi.mocked(ownedListing); const syncMock = vi.mocked(syncAuctionStatuses);
function contextFor(role: "user" | "admin" = "user"): TrpcContext { const now = new Date(); return { user: { id: 7, openId: "procedure-user", name: "Tester", email: "test@example.com", phone: null, avatarUrl: null, loginMethod: "test", role, status: "active", createdAt: now, updatedAt: now, lastSignedIn: now }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] }; }
const bidRow = { auction: { id: 5, listingId: 9, status: "live" as const, currentBid: "10000", minimumIncrement: "500", endsAt: Date.now() + 60_000, startsAt: Date.now() - 60_000, startPrice: "9000", reservePrice: null, buyNowPrice: null, winnerId: null, reminderSentAt: null, createdAt: 1, updatedAt: 1 }, listing: { id: 9, ownerId: 2, title: "سيارة اختبار", status: "published" as const } };

beforeEach(() => { vi.clearAllMocks(); syncMock.mockResolvedValue(undefined); auditMock.mockResolvedValue(undefined); notifyMock.mockResolvedValue(undefined); });

describe("critical marketplace procedures", () => {

  it("يسمح لصاحب الإعلان بتعديل إعلان منشور ويعيده للمراجعة", async () => {
    const db = { update: () => ({ set: () => ({ where: async () => [] }) }), select: () => ({ from: () => ({ where: async () => [] }) }) };
    getDbMock.mockResolvedValue(db as never);
    ownedListingMock.mockResolvedValue({ id: 81, ownerId: 7, status: "published" } as never);
    await expect(appRouter.createCaller(contextFor()).marketplace.listings.save({ id: 81, title: "تويوتا كامري 2022 بعد التحديث", description: "سيارة بحالة ممتازة، مفحوصة وجاهزة للاستخدام مع سجل صيانة واضح ومواصفات كاملة.", make: "تويوتا", model: "كامري", year: 2022, mileage: 42000, fuelType: "gasoline", transmission: "automatic", bodyType: "سيدان", condition: "excellent", city: "صنعاء", contactPhone: "777123456", showWhatsapp: false, allowNegotiation: true, saleType: "sale", askingPrice: 18500000, submitForReview: true })).resolves.toEqual({ id: 81, status: "pending" });
    expect(auditMock).toHaveBeenCalledWith(7, "listing.updated", "listing", 81);
  });

  it("يرفض تعديل إعلان لا يملكه المستخدم", async () => {
    getDbMock.mockResolvedValue({ update: () => ({ set: () => ({ where: async () => [] }) }) } as never);
    ownedListingMock.mockResolvedValue(undefined);
    await expect(appRouter.createCaller(contextFor()).marketplace.listings.save({ id: 82, title: "تويوتا كامري 2022 بعد التحديث", description: "سيارة بحالة ممتازة، مفحوصة وجاهزة للاستخدام مع سجل صيانة واضح ومواصفات كاملة.", make: "تويوتا", model: "كامري", year: 2022, mileage: 42000, fuelType: "gasoline", transmission: "automatic", bodyType: "سيدان", condition: "excellent", city: "صنعاء", contactPhone: "777123456", showWhatsapp: false, allowNegotiation: true, saleType: "sale", askingPrice: 18500000, submitForReview: false })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("يرفض تغيير إعدادات مزاد مباشر حتى لا تتأثر المزايدات القائمة", async () => {
    const liveAuction = { id: 9, listingId: 83, status: "live" as const };
    const db = { select: () => ({ from: () => ({ where: () => ({ limit: async () => [liveAuction] }) }) }), update: () => ({ set: () => ({ where: async () => [] }) }) };
    getDbMock.mockResolvedValue(db as never);
    ownedListingMock.mockResolvedValue({ id: 83, ownerId: 7, status: "published" } as never);
    await expect(appRouter.createCaller(contextFor()).marketplace.listings.save({ id: 83, title: "تويوتا كامري 2022 بعد التحديث", description: "سيارة بحالة ممتازة، مفحوصة وجاهزة للاستخدام مع سجل صيانة واضح ومواصفات كاملة.", make: "تويوتا", model: "كامري", year: 2022, mileage: 42000, fuelType: "gasoline", transmission: "automatic", bodyType: "سيدان", condition: "excellent", city: "صنعاء", contactPhone: "777123456", showWhatsapp: false, allowNegotiation: true, saleType: "auction", auction: { startPrice: 18000000, minimumIncrement: 250000, startsAt: Date.now() + 60_000, endsAt: Date.now() + 3_600_000 }, submitForReview: true })).rejects.toMatchObject({ code: "CONFLICT" });
  });
  it("يسجل المزايدة الخادمية فقط بعد تجاوز الحد الأدنى وينشئ إشعارًا للبائع", async () => {
    const tx = { update: () => ({ set: () => ({ where: async () => [{ affectedRows: 1 }] }) }), insert: () => ({ values: async () => [{ insertId: 55 }] }) };
    const db = { select: () => ({ from: () => ({ innerJoin: () => ({ where: () => ({ limit: async () => [bidRow] }) }) }) }), transaction: async (work: (client: typeof tx) => Promise<number>) => work(tx) };
    getDbMock.mockResolvedValue(db as never);
    const result = await appRouter.createCaller(contextFor()).marketplace.auctions.placeBid({ auctionId: 5, amount: 10500 });
    expect(result).toEqual({ bidId: 55, amount: 10500 });
    expect(notifyMock).toHaveBeenCalledWith(2, "bid", "مزايدة جديدة", expect.any(String), "/listings/9");
  });

  it("يرفض المزايدة الأقل من الحد الأدنى قبل تنفيذ المعاملة", async () => {
    const db = { select: () => ({ from: () => ({ innerJoin: () => ({ where: () => ({ limit: async () => [bidRow] }) }) }) }) };
    getDbMock.mockResolvedValue(db as never);
    await expect(appRouter.createCaller(contextFor()).marketplace.auctions.placeBid({ auctionId: 5, amount: 10499 })).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("ينشئ رسالة ويشعر الطرف الآخر في المحادثة", async () => {
    const conversation = { id: 11, listingId: 9, buyerId: 7, sellerId: 2, createdAt: 1, updatedAt: 1 };
    const db = { select: () => ({ from: () => ({ where: () => ({ limit: async () => [conversation] }) }) }), insert: () => ({ values: async () => [{ insertId: 77 }] }), update: () => ({ set: () => ({ where: async () => [] }) }) };
    getDbMock.mockResolvedValue(db as never);
    const result = await appRouter.createCaller(contextFor()).marketplace.messages.send({ conversationId: 11, content: "هل السيارة متاحة؟" });
    expect(result.id).toBe(77);
    expect(notifyMock).toHaveBeenCalledWith(2, "message", "رسالة جديدة", expect.any(String), "/messages");
  });

  it("يسمح للمشرف باعتماد الإعلان وينشئ إشعار الاعتماد", async () => {
    const listing = { id: 9, ownerId: 2, title: "سيارة اختبار", publishedAt: null };
    const db = { select: () => ({ from: () => ({ where: () => ({ limit: async () => [listing] }) }) }), update: () => ({ set: () => ({ where: async () => [] }) }) };
    getDbMock.mockResolvedValue(db as never);
    await expect(appRouter.createCaller(contextFor("admin")).marketplace.admin.reviewListing({ listingId: 9, decision: "published" })).resolves.toEqual({ success: true });
    expect(notifyMock).toHaveBeenCalledWith(2, "listing", "تم اعتماد إعلانك", expect.any(String), "/listings/9");
  });

  it("يرسل الإعلان الصالح إلى المراجعة ويبلغ المشرفين النشطين", async () => {
    const db = { insert: () => ({ values: async () => [{ insertId: 81 }] }), select: () => ({ from: () => ({ where: async () => [{ id: 44 }] }) }) };
    getDbMock.mockResolvedValue(db as never);
    const result = await appRouter.createCaller(contextFor()).marketplace.listings.save({ title: "تويوتا كامري 2022 فل كامل", description: "سيارة بحالة ممتازة، مفحوصة وجاهزة للاستخدام مع سجل صيانة واضح ومواصفات كاملة.", make: "تويوتا", model: "كامري", year: 2022, mileage: 42000, fuelType: "gasoline", transmission: "automatic", bodyType: "سيدان", condition: "excellent", city: "صنعاء", contactPhone: "777123456", showWhatsapp: false, allowNegotiation: true, saleType: "sale", askingPrice: 18500000, submitForReview: true });
    expect(result).toEqual({ id: 81, status: "pending" });
    expect(notifyMock).toHaveBeenCalledWith(44, "listing", "إعلان جديد بانتظار المراجعة", expect.any(String), "/admin");
  });

  it("يعيد إعلانات صاحب الحساب مع صورة الغلاف والمزاد لعرضها في الحساب", async () => {
    const row = { listing: { id: 31, title: "سيارة صاحب الحساب", status: "pending" as const, askingPrice: "18000000" }, image: { id: 71, listingId: 31, url: "/manus-storage/listings/7/31/car.webp", sortOrder: 0 }, auction: null };
    const db = { select: () => ({ from: () => ({ leftJoin: () => ({ leftJoin: () => ({ where: () => ({ orderBy: async () => [row] }) }) }) }) }) };
    getDbMock.mockResolvedValue(db as never);
    await expect(appRouter.createCaller(contextFor()).marketplace.listings.mine()).resolves.toEqual([row]);
  });

  it("ينهي المزاد إداريًا ويحدد أعلى مزايد ثم يشعر البائع والفائز", async () => {
    const auction = { ...bidRow.auction, id: 5, listingId: 9, status: "live" as const };
    const listing = { id: 9, ownerId: 2, title: "سيارة اختبار" };
    const topBid = { id: 91, auctionId: 5, bidderId: 13, amount: "13000", createdAt: 2 };
    const select = vi.fn()
      .mockReturnValueOnce({ from: () => ({ innerJoin: () => ({ where: () => ({ limit: async () => [{ auction, listing }] }) }) }) })
      .mockReturnValueOnce({ from: () => ({ where: () => ({ orderBy: () => ({ limit: async () => [topBid] }) }) }) });
    const db = { select, update: () => ({ set: () => ({ where: async () => [] }) }) };
    getDbMock.mockResolvedValue(db as never);
    await expect(appRouter.createCaller(contextFor("admin")).marketplace.admin.closeAuction({ auctionId: 5, action: "ended" })).resolves.toEqual({ success: true, winnerId: 13 });
    expect(notifyMock).toHaveBeenCalledWith(2, "auction", "تم إنهاء المزاد", expect.any(String), "/listings/9");
    expect(notifyMock).toHaveBeenCalledWith(13, "auction", "أصبحت أعلى مزايدة", expect.any(String), "/listings/9");
  });
});
