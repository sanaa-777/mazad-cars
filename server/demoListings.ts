type DemoInput = { query?: string; make?: string; city?: string; saleType?: "sale" | "auction"; minPrice?: number; maxPrice?: number; sort?: "newest" | "priceAsc" | "priceDesc" | "yearDesc"; page: number; pageSize: number };

const baseTime = Date.now();
const demoListings = [
  { listing: { id: 990001, ownerId: -990001, title: "تجريبي — غير متاح للبيع | تويوتا كامري 2022", description: "هذه بطاقة معاينة داخل بيئة التطوير فقط لاختبار تفاصيل السيارة والبحث والعرض. ليست سيارة معروضة للبيع أو للتواصل.", make: "تويوتا", model: "كامري", year: 2022, mileage: 42000, fuelType: "gasoline" as const, transmission: "automatic" as const, bodyType: "سيدان", color: "أبيض", condition: "excellent" as const, city: "صنعاء", district: "التحرير", contactPhone: "000000000", showWhatsapp: false, allowNegotiation: false, saleType: "auction" as const, askingPrice: null, status: "published" as const, rejectionReason: null, publishedAt: baseTime, createdAt: baseTime, updatedAt: baseTime, isDemo: true }, image: null, auction: { id: 999001, listingId: 990001, startPrice: "18000000", currentBid: "19250000", minimumIncrement: "250000", reservePrice: null, buyNowPrice: null, startsAt: baseTime - 60 * 60 * 1000, endsAt: baseTime + 3 * 60 * 60 * 1000, status: "live" as const, winnerId: null, reminderSentAt: null, createdAt: baseTime, updatedAt: baseTime } },
  { listing: { id: 990002, ownerId: -990002, title: "تجريبي — غير متاح للبيع | هيونداي توسان 2023", description: "هذا محتوى معاينة محلي لاختبار بطاقة البيع المباشر والفلاتر والفرز. لا يمثل عرضًا حقيقيًا ولا يمكن التواصل بخصوصه.", make: "هيونداي", model: "توسان", year: 2023, mileage: 18000, fuelType: "gasoline" as const, transmission: "automatic" as const, bodyType: "SUV", color: "رمادي", condition: "excellent" as const, city: "عدن", district: "المنصورة", contactPhone: "000000000", showWhatsapp: false, allowNegotiation: false, saleType: "sale" as const, askingPrice: "26500000", status: "published" as const, rejectionReason: null, publishedAt: baseTime - 60_000, createdAt: baseTime - 60_000, updatedAt: baseTime - 60_000, isDemo: true }, image: null, auction: null },
  { listing: { id: 990003, ownerId: -990003, title: "تجريبي — غير متاح للبيع | نيسان باترول 2021", description: "بطاقة معاينة ثالثة لاختبار الترقيم والفرز والبحث في سوق السيارات دون تخزين أو نشر بيانات تجارية وهمية.", make: "نيسان", model: "باترول", year: 2021, mileage: 68000, fuelType: "gasoline" as const, transmission: "automatic" as const, bodyType: "SUV", color: "أسود", condition: "good" as const, city: "تعز", district: null, contactPhone: "000000000", showWhatsapp: false, allowNegotiation: false, saleType: "auction" as const, askingPrice: null, status: "published" as const, rejectionReason: null, publishedAt: baseTime - 120_000, createdAt: baseTime - 120_000, updatedAt: baseTime - 120_000, isDemo: true }, image: null, auction: { id: 999003, listingId: 990003, startPrice: "30000000", currentBid: "31200000", minimumIncrement: "300000", reservePrice: null, buyNowPrice: null, startsAt: baseTime + 90 * 60 * 1000, endsAt: baseTime + 6 * 60 * 60 * 1000, status: "scheduled" as const, winnerId: null, reminderSentAt: null, createdAt: baseTime, updatedAt: baseTime } },
];

export const isDemoListingId = (id: number) => demoListings.some((item) => item.listing.id === id);
export const isDemoAuctionId = (id: number) => demoListings.some((item) => item.auction?.id === id);
export const demoModeEnabled = () => process.env.NODE_ENV !== "production";

export function demoPublicListings(input: DemoInput) {
  if (!demoModeEnabled()) return [];
  const query = input.query?.trim().toLocaleLowerCase("ar") || "";
  const filtered = demoListings.filter((item) => {
    const listing = item.listing; const price = Number(listing.askingPrice ?? item.auction?.currentBid ?? 0);
    return (!query || `${listing.title} ${listing.make} ${listing.model} ${listing.city}`.toLocaleLowerCase("ar").includes(query)) && (!input.make || listing.make === input.make) && (!input.city || listing.city === input.city) && (!input.saleType || listing.saleType === input.saleType) && (!input.minPrice || price >= input.minPrice) && (!input.maxPrice || price <= input.maxPrice);
  });
  filtered.sort((a, b) => input.sort === "priceAsc" ? Number(a.listing.askingPrice ?? a.auction?.currentBid ?? 0) - Number(b.listing.askingPrice ?? b.auction?.currentBid ?? 0) : input.sort === "priceDesc" ? Number(b.listing.askingPrice ?? b.auction?.currentBid ?? 0) - Number(a.listing.askingPrice ?? a.auction?.currentBid ?? 0) : input.sort === "yearDesc" ? b.listing.year - a.listing.year : b.listing.publishedAt - a.listing.publishedAt);
  return filtered.slice((input.page - 1) * input.pageSize, input.page * input.pageSize);
}

export function demoListingDetail(id: number) {
  if (!demoModeEnabled()) return null;
  const item = demoListings.find((entry) => entry.listing.id === id);
  if (!item) return null;
  const bidHistory = item.auction ? [{ bid: { id: item.auction.id * 10, auctionId: item.auction.id, bidderId: -1, amount: item.auction.currentBid, createdAt: baseTime - 15 * 60 * 1000 }, bidder: "مشارك تجريبي" }] : [];
  return { listing: item.listing, images: [], auction: item.auction, bidHistory, isDemo: true };
}
