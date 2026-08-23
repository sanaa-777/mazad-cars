import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("public accessibility contract", () => {
  it("يوفر التنقل أسماء وصول ومسارًا نشطًا وحلقات تركيز مرئية", () => {
    const layout = source("client/src/components/MarketplaceLayout.tsx");
    expect(layout).toContain('aria-label="التنقل الرئيسي"');
    expect(layout).toContain("aria-current");
    expect(layout).toContain("focus-visible:ring-2");
  });

  it("يعرض الصفحة الرئيسية والسوق والمزادات حالات تحميل وخطأ قابلة للإعلان", () => {
    const home = source("client/src/pages/HomeNew.tsx");
    const listings = source("client/src/pages/Listings.tsx");
    const auctions = source("client/src/pages/Auctions.tsx");
    expect(home).toContain("aria-live=\"polite\"");
    expect(home).toContain("role=\"alert\"");
    expect(listings).toContain("result.isError");
    expect(listings).toContain("sr-only");
    expect(auctions).toContain("auctions.isError");
    expect(auctions).toContain("role=\"alert\"");
  });

  it("يميز تفاصيل الإعلان بين التحميل والخطأ وعدم الوجود", () => {
    const detail = source("client/src/pages/ListingDetail.tsx");
    expect(detail).toContain("detail.isLoading");
    expect(detail).toContain("detail.isError");
    expect(detail).toContain("role=\"alert\"");
  });

  it("يحافظ نموذج الإعلان على تسميات الحقول وحالة الاختيار القابلة للقارئات", () => {
    const form = source("client/src/pages/NewListing.tsx");
    expect(form).toContain("<form");
    expect(form).toContain("<label");
    expect(form).toContain("aria-pressed");
    expect(form).toContain("focus-visible:ring-2");
  });
});
