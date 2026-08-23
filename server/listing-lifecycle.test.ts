import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, addAudit: vi.fn(), createNotification: vi.fn(), getDb: vi.fn(), ownedListing: vi.fn() };
});
vi.mock("./storage", () => ({ storagePut: vi.fn() }));

import { appRouter } from "./routers";
import { addAudit, createNotification, getDb, ownedListing } from "./db";
import { storagePut } from "./storage";

function context(role: "user" | "admin" = "user"): TrpcContext { const now = new Date(); return { user: { id: role === "admin" ? 44 : 7, openId: `${role}-workflow`, name: role, email: `${role}@example.com`, phone: null, avatarUrl: null, loginMethod: "test", role, status: "active", createdAt: now, updatedAt: now, lastSignedIn: now }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] }; }
const input = { title: "تويوتا كامري 2022 بحالة ممتازة", description: "سيارة بحالة ممتازة ومفحوصة مع سجل صيانة واضح ومواصفات كاملة للاستخدام اليومي.", make: "تويوتا", model: "كامري", year: 2022, mileage: 42000, fuelType: "gasoline" as const, transmission: "automatic" as const, bodyType: "سيدان", condition: "excellent" as const, city: "صنعاء", contactPhone: "777123456", showWhatsapp: false, allowNegotiation: true, saleType: "sale" as const, askingPrice: 18500000 };

describe("listing lifecycle", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.mocked(addAudit).mockResolvedValue(undefined); vi.mocked(createNotification).mockResolvedValue(undefined); vi.mocked(storagePut).mockResolvedValue({ key: "listings/7/101/car.webp", url: "/manus-storage/listings/7/101/car.webp" }); });
  it("يحفظ مسودة ويرفع صورة ويرسلها للمراجعة ثم ينشرها المشرف", async () => {
    let phase: "draft" | "submit" | "review" = "draft";
    const listing = { id: 101, ownerId: 7, title: input.title, publishedAt: null };
    const db = {
      insert: () => ({ values: async () => [{ insertId: 101 }] }),
      update: () => ({ set: () => ({ where: async () => [] }) }),
      select: () => ({ from: () => ({ where: () => phase === "submit" ? Promise.resolve([{ id: 44 }]) : ({ limit: async () => [listing] }) }) }),
    };
    vi.mocked(getDb).mockResolvedValue(db as never);
    const user = appRouter.createCaller(context());
    await expect(user.marketplace.listings.save({ ...input, submitForReview: false })).resolves.toEqual({ id: 101, status: "draft" });
    vi.mocked(ownedListing).mockResolvedValue({ id: 101, ownerId: 7, status: "draft" } as never);
    await expect(user.marketplace.listings.uploadImage({ listingId: 101, fileName: "car.webp", content: "data:image/webp;base64,AA==", alt: "صورة كامري للاختبار", sortOrder: 0 })).resolves.toEqual({ id: 101, url: "/manus-storage/listings/7/101/car.webp" });
    phase = "submit";
    await expect(user.marketplace.listings.save({ ...input, id: 101, submitForReview: true })).resolves.toEqual({ id: 101, status: "pending" });
    expect(createNotification).toHaveBeenCalledWith(44, "listing", "إعلان جديد بانتظار المراجعة", expect.any(String), "/admin");
    phase = "review";
    await expect(appRouter.createCaller(context("admin")).marketplace.admin.reviewListing({ listingId: 101, decision: "published" })).resolves.toEqual({ success: true });
    expect(createNotification).toHaveBeenCalledWith(7, "listing", "تم اعتماد إعلانك", expect.any(String), "/listings/101");
  });
});
