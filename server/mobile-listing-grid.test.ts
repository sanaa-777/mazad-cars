import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectFile = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("mobile listing grids", () => {
  it("يعرض بطاقتين على الجوال في الرئيسية والسوق والمزادات والحساب", () => {
    ["client/src/pages/HomeNew.tsx", "client/src/pages/Listings.tsx", "client/src/pages/Auctions.tsx", "client/src/pages/Profile.tsx"].forEach((path) => {
      expect(projectFile(path)).toContain("grid-cols-2");
    });
  });

  it("يبقي محتوى بطاقة الجوال مضغوطًا ومقروءًا مع تحسينات للشاشات الأكبر", () => {
    const card = projectFile("client/src/components/ListingCard.tsx");
    expect(card).toContain("aspect-[5/4]");
    expect(card).toContain("sm:aspect-[4/3]");
    expect(card).toContain("sm:text-lg");
  });
});
