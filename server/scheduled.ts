import type { Request, Response } from "express";
import { and, eq, isNull } from "drizzle-orm";
import { auctions, bids, listings } from "../drizzle/schema";
import { createNotification, getDb } from "./db";
import { sdk } from "./_core/sdk";
import { shouldSendAuctionReminder } from "./auctionReminderRules";

/**
 * Project-level Heartbeat callback. It is deliberately idempotent: a conditional
 * update claims each auction before notifications are written, so retried callbacks
 * do not create duplicate reminders.
 */
export async function sendAuctionReminders(req: Request, res: Response) {
  try {
    const caller = await sdk.authenticateRequest(req);
    if (!caller.isCron || !caller.taskUid) return res.status(403).json({ error: "cron-only" });
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "database-unavailable" });
    const now = Date.now(); const windowEnd = now + 30 * 60 * 1000;
    const due = await db.select({ auction: auctions, listing: listings }).from(auctions).innerJoin(listings, eq(listings.id, auctions.listingId)).where(and(eq(auctions.status, "live"), isNull(auctions.reminderSentAt)));
    let notified = 0;
    for (const row of due) {
      if (!shouldSendAuctionReminder(row.auction, now)) continue;
      const claim = await db.update(auctions).set({ reminderSentAt: now, updatedAt: now }).where(and(eq(auctions.id, row.auction.id), isNull(auctions.reminderSentAt)));
      if ((claim[0] as { affectedRows?: number }).affectedRows !== 1) continue;
      const bidRows = await db.select({ bidderId: bids.bidderId }).from(bids).where(eq(bids.auctionId, row.auction.id));
      const recipients = new Set<number>([row.listing.ownerId, ...bidRows.map((bid) => bid.bidderId)]);
      await Promise.all(Array.from(recipients).map((userId) => createNotification(userId, "auction", "المزاد يقترب من الانتهاء", `سينتهي مزاد «${row.listing.title}» خلال أقل من 30 دقيقة.`, `/listings/${row.listing.id}`)));
      notified += recipients.size;
    }
    return res.json({ ok: true, taskUid: caller.taskUid, notified, timestamp: now });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "auction-reminders-failed", timestamp: Date.now() });
  }
}
