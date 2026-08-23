import { and, asc, desc, eq, gte, like, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { auctions, auditLogs, bids, conversations, favorites, InsertUser, listingImages, listings, messages, notifications, users, verificationDocuments } from "../drizzle/schema";
import { ENV } from "./_core/env";

let database: ReturnType<typeof drizzle> | null = null;
export async function getDb() { if (!database && process.env.DATABASE_URL) database = drizzle(process.env.DATABASE_URL); return database; }

export async function upsertUser(user: InsertUser): Promise<void> {
  const db = await getDb(); if (!db || !user.openId) return;
  const now = new Date();
  await db.insert(users).values({ ...user, role: user.openId === ENV.ownerOpenId ? "admin" : user.role ?? "user", lastSignedIn: now }).onDuplicateKeyUpdate({ set: { name: user.name ?? null, email: user.email ?? null, loginMethod: user.loginMethod ?? null, lastSignedIn: now, ...(user.openId === ENV.ownerOpenId ? { role: "admin" as const } : {}) } });
}
export async function getUserByOpenId(openId: string) { const db = await getDb(); if (!db) return undefined; return (await db.select().from(users).where(eq(users.openId, openId)).limit(1))[0]; }
export async function addAudit(actorId: number | null, action: string, entityType: string, entityId?: number, detail?: string) { const db = await getDb(); if (!db) return; await db.insert(auditLogs).values({ actorId, action, entityType, entityId, detail, createdAt: Date.now() }); }
export async function createNotification(userId: number, type: "listing" | "bid" | "message" | "verification" | "auction", title: string, body: string, href?: string) { const db = await getDb(); if (!db) return; await db.insert(notifications).values({ userId, type, title, body, href, createdAt: Date.now() }); }
export async function syncAuctionStatuses() { const db = await getDb(); if (!db) return; const now = Date.now(); await db.update(auctions).set({ status: "live", updatedAt: now }).where(and(eq(auctions.status, "scheduled"), lte(auctions.startsAt, now), gte(auctions.endsAt, now))); await db.update(auctions).set({ status: "ended", updatedAt: now }).where(and(eq(auctions.status, "live"), lte(auctions.endsAt, now))); }

export async function publicListings(input: { query?: string; make?: string; city?: string; saleType?: "sale" | "auction"; minPrice?: number; maxPrice?: number; sort?: "newest" | "priceAsc" | "priceDesc" | "yearDesc"; page: number; pageSize: number }) {
  const db = await getDb(); if (!db) return { items: [], total: 0 };
  await syncAuctionStatuses();
  const filters = [eq(listings.status, "published")];
  if (input.make) filters.push(eq(listings.make, input.make)); if (input.city) filters.push(eq(listings.city, input.city)); if (input.saleType) filters.push(eq(listings.saleType, input.saleType));
  if (input.query) { const q = `%${input.query.trim()}%`; filters.push(or(like(listings.title, q), like(listings.make, q), like(listings.model, q), like(listings.city, q))!); }
  if (input.minPrice) filters.push(gte(listings.askingPrice, String(input.minPrice))); if (input.maxPrice) filters.push(lte(listings.askingPrice, String(input.maxPrice)));
  const order = input.sort === "priceAsc" ? asc(listings.askingPrice) : input.sort === "priceDesc" ? desc(listings.askingPrice) : input.sort === "yearDesc" ? desc(listings.year) : desc(listings.publishedAt);
  const rows = await db.select({ listing: listings, image: listingImages, auction: auctions }).from(listings).leftJoin(listingImages, and(eq(listingImages.listingId, listings.id), eq(listingImages.sortOrder, 0))).leftJoin(auctions, eq(auctions.listingId, listings.id)).where(and(...filters)).orderBy(order).limit(input.pageSize).offset((input.page - 1) * input.pageSize);
  const totalRows = await db.select({ value: sql<number>`count(*)` }).from(listings).where(and(...filters));
  return { items: rows, total: Number(totalRows[0]?.value ?? 0) };
}

export async function listingDetails(id: number) { const db = await getDb(); if (!db) return null; await syncAuctionStatuses(); const listing = (await db.select().from(listings).where(eq(listings.id, id)).limit(1))[0]; if (!listing) return null; const [images, auction] = await Promise.all([db.select().from(listingImages).where(eq(listingImages.listingId, id)).orderBy(listingImages.sortOrder), db.select().from(auctions).where(eq(auctions.listingId, id)).limit(1)]); const bidHistory = auction[0] ? await db.select({ bid: bids, bidder: users.name }).from(bids).leftJoin(users, eq(users.id, bids.bidderId)).where(eq(bids.auctionId, auction[0].id)).orderBy(desc(bids.createdAt)).limit(20) : []; return { listing, images, auction: auction[0] ?? null, bidHistory }; }
export async function ownedListing(id: number, userId: number) { const db = await getDb(); if (!db) return undefined; return (await db.select().from(listings).where(and(eq(listings.id, id), eq(listings.ownerId, userId))).limit(1))[0]; }
export async function getOrCreateConversation(listingId: number, buyerId: number, sellerId: number) { const db = await getDb(); if (!db) throw new Error("قاعدة البيانات غير متاحة"); const existing = (await db.select().from(conversations).where(and(eq(conversations.listingId, listingId), eq(conversations.buyerId, buyerId), eq(conversations.sellerId, sellerId))).limit(1))[0]; if (existing) return existing; const now = Date.now(); const result = await db.insert(conversations).values({ listingId, buyerId, sellerId, createdAt: now, updatedAt: now }); return { id: Number(result[0].insertId), listingId, buyerId, sellerId, createdAt: now, updatedAt: now }; }
export { auctions, auditLogs, bids, conversations, favorites, listingImages, listings, messages, notifications, users, verificationDocuments };
