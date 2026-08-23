import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function contextFor(role: "user" | "admin", status: "active" | "suspended"): TrpcContext {
  const now = new Date();
  return {
    user: { id: 42, openId: "test-user", name: "Test", email: "test@example.com", phone: null, avatarUrl: null, loginMethod: "test", role, status, createdAt: now, updatedAt: now, lastSignedIn: now },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("marketplace access control", () => {
  it("يمنع المستخدم المعلق قبل الوصول إلى إجراء محمي", async () => {
    const caller = appRouter.createCaller(contextFor("user", "suspended"));
    await expect(caller.marketplace.listings.mine()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("يمنع المستخدم العادي من الوصول إلى إجراءات المشرف", async () => {
    const caller = appRouter.createCaller(contextFor("user", "active"));
    await expect(caller.marketplace.admin.dashboard()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
