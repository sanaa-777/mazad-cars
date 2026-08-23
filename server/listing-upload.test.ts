import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, getDb: vi.fn(), ownedListing: vi.fn() };
});
vi.mock("./storage", () => ({ storagePut: vi.fn() }));

import { appRouter } from "./routers";
import { getDb, ownedListing } from "./db";
import { storagePut } from "./storage";

function context(): TrpcContext { const now = new Date(); return { user: { id: 7, openId: "upload-user", name: "Tester", email: "test@example.com", phone: null, avatarUrl: null, loginMethod: "test", role: "user", status: "active", createdAt: now, updatedAt: now, lastSignedIn: now }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] }; }

describe("listing image upload", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it("يخزن الصورة في التخزين ويحفظ مرجعها وبياناتها الوصفية فقط", async () => {
    vi.mocked(ownedListing).mockResolvedValue({ id: 12, ownerId: 7 } as never);
    vi.mocked(storagePut).mockResolvedValue({ key: "listings/7/12/photo.webp", url: "/manus-storage/listings/7/12/photo.webp" });
    const values = vi.fn().mockResolvedValue([{ insertId: 91 }]); const db = { insert: vi.fn(() => ({ values })) };
    vi.mocked(getDb).mockResolvedValue(db as never);
    const result = await appRouter.createCaller(context()).marketplace.listings.uploadImage({ listingId: 12, fileName: "car.webp", content: "data:image/webp;base64,AA==", alt: "صورة سيارة للاختبار", sortOrder: 0 });
    expect(storagePut).toHaveBeenCalledWith(expect.stringContaining("listings/7/12/"), expect.any(Buffer), "image/webp");
    expect(values).toHaveBeenCalledWith(expect.objectContaining({ listingId: 12, storageKey: "listings/7/12/photo.webp", url: "/manus-storage/listings/7/12/photo.webp", alt: "صورة سيارة للاختبار", mimeType: "image/webp" }));
    expect(result).toEqual({ id: 91, url: "/manus-storage/listings/7/12/photo.webp" });
  });
});
