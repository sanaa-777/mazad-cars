import { bigint, boolean, decimal, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  avatarUrl: varchar("avatarUrl", { length: 1024 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  status: mysqlEnum("status", ["active", "suspended"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const listings = mysqlTable("listings", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description").notNull(),
  make: varchar("make", { length: 80 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: int("year").notNull(),
  mileage: int("mileage").notNull(),
  fuelType: mysqlEnum("fuelType", ["gasoline", "diesel", "hybrid", "electric"]).notNull(),
  transmission: mysqlEnum("transmission", ["automatic", "manual"]).notNull(),
  bodyType: varchar("bodyType", { length: 60 }).notNull(),
  color: varchar("color", { length: 60 }),
  condition: mysqlEnum("condition", ["new", "excellent", "good", "fair", "repair_needed"]).notNull(),
  city: varchar("city", { length: 80 }).notNull(),
  district: varchar("district", { length: 100 }),
  contactPhone: varchar("contactPhone", { length: 32 }).notNull(),
  showWhatsapp: boolean("showWhatsapp").default(false).notNull(),
  allowNegotiation: boolean("allowNegotiation").default(false).notNull(),
  saleType: mysqlEnum("saleType", ["sale", "auction"]).notNull(),
  askingPrice: decimal("askingPrice", { precision: 16, scale: 0 }),
  status: mysqlEnum("status", ["draft", "pending", "published", "rejected", "sold", "archived"]).default("draft").notNull(),
  rejectionReason: varchar("rejectionReason", { length: 500 }),
  publishedAt: bigint("publishedAt", { mode: "number" }),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
}, (table) => [index("listings_owner_idx").on(table.ownerId), index("listings_status_idx").on(table.status), index("listings_search_idx").on(table.make, table.model, table.city), index("listings_sale_type_idx").on(table.saleType)]);

export const listingImages = mysqlTable("listingImages", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  storageKey: varchar("storageKey", { length: 1024 }).notNull(),
  url: varchar("url", { length: 2048 }).notNull(),
  alt: varchar("alt", { length: 220 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  byteSize: int("byteSize").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
}, (table) => [index("listing_images_listing_idx").on(table.listingId)]);

export const verificationDocuments = mysqlTable("verificationDocuments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  documentType: mysqlEnum("documentType", ["identity", "business_registration", "vehicle_ownership"]).notNull(),
  storageKey: varchar("storageKey", { length: 1024 }).notNull(),
  url: varchar("url", { length: 2048 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  byteSize: int("byteSize").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewNote: varchar("reviewNote", { length: 500 }),
  reviewedBy: int("reviewedBy"),
  reviewedAt: bigint("reviewedAt", { mode: "number" }),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
}, (table) => [index("verification_docs_user_idx").on(table.userId), index("verification_docs_status_idx").on(table.status)]);

export const auctions = mysqlTable("auctions", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  startPrice: decimal("startPrice", { precision: 16, scale: 0 }).notNull(),
  currentBid: decimal("currentBid", { precision: 16, scale: 0 }).notNull(),
  minimumIncrement: decimal("minimumIncrement", { precision: 16, scale: 0 }).notNull(),
  reservePrice: decimal("reservePrice", { precision: 16, scale: 0 }),
  buyNowPrice: decimal("buyNowPrice", { precision: 16, scale: 0 }),
  startsAt: bigint("startsAt", { mode: "number" }).notNull(),
  endsAt: bigint("endsAt", { mode: "number" }).notNull(),
  status: mysqlEnum("status", ["scheduled", "live", "ended", "cancelled"]).default("scheduled").notNull(),
  winnerId: int("winnerId"),
  reminderSentAt: bigint("reminderSentAt", { mode: "number" }),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
}, (table) => [uniqueIndex("auction_listing_unique").on(table.listingId), index("auction_status_end_idx").on(table.status, table.endsAt)]);

export const bids = mysqlTable("bids", {
  id: int("id").autoincrement().primaryKey(),
  auctionId: int("auctionId").notNull(),
  bidderId: int("bidderId").notNull(),
  amount: decimal("amount", { precision: 16, scale: 0 }).notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
}, (table) => [index("bids_auction_created_idx").on(table.auctionId, table.createdAt), index("bids_bidder_idx").on(table.bidderId)]);

export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  listingId: int("listingId").notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
}, (table) => [uniqueIndex("favorite_user_listing_unique").on(table.userId, table.listingId), index("favorites_listing_idx").on(table.listingId)]);

export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  buyerId: int("buyerId").notNull(),
  sellerId: int("sellerId").notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
}, (table) => [uniqueIndex("conversation_unique_pair").on(table.listingId, table.buyerId, table.sellerId), index("conversation_buyer_idx").on(table.buyerId), index("conversation_seller_idx").on(table.sellerId)]);

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(),
  content: text("content").notNull(),
  readAt: bigint("readAt", { mode: "number" }),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
}, (table) => [index("messages_conversation_created_idx").on(table.conversationId, table.createdAt)]);

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["listing", "bid", "message", "verification", "auction"]).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  body: varchar("body", { length: 500 }).notNull(),
  href: varchar("href", { length: 500 }),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
}, (table) => [index("notifications_user_read_idx").on(table.userId, table.isRead, table.createdAt)]);

export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  actorId: int("actorId"),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 80 }).notNull(),
  entityId: int("entityId"),
  detail: varchar("detail", { length: 1000 }),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
}, (table) => [index("audit_entity_idx").on(table.entityType, table.entityId), index("audit_actor_idx").on(table.actorId, table.createdAt)]);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
