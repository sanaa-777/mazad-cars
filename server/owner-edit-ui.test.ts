import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("owner edit and mobile administration contracts", () => {
  it("يوفر مسار التحرير وروابط واضحة لصاحب الإعلان", () => {
    const routes = source("client/src/App.tsx");
    const profile = source("client/src/pages/Profile.tsx");
    const detail = source("client/src/pages/ListingDetail.tsx");
    const form = source("client/src/pages/NewListing.tsx");
    expect(routes).toContain('path={"/listings/:id/edit"}');
    expect(profile).toContain("تعديل الإعلان");
    expect(detail).toContain("const isOwner = auth.user?.id === listing.ownerId");
    expect(form).toContain("marketplace.listings.edit.useQuery");
    expect(form).toContain("أُرسلت تعديلات الإعلان للمراجعة");
  });

  it("يحافظ على لوحة إدارة متجاوبة مع تبويبات وإجراءات مناسبة للهاتف", () => {
    const admin = source("client/src/pages/Admin.tsx");
    const shell = source("client/src/components/DashboardLayout.tsx");
    expect(admin).toContain("grid grid-cols-2 gap-2 sm:flex");
    expect(admin).toContain("grid grid-cols-2 gap-2 sm:mt-0 sm:flex");
    expect(admin).toContain("grid grid-cols-3 gap-2.5");
    expect(shell).toContain("فتح تنقل الإدارة");
    expect(shell).toContain("min-w-0 flex-1 p-3");
  });
});
