CREATE TABLE `auctions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`startPrice` decimal(16,0) NOT NULL,
	`currentBid` decimal(16,0) NOT NULL,
	`minimumIncrement` decimal(16,0) NOT NULL,
	`reservePrice` decimal(16,0),
	`buyNowPrice` decimal(16,0),
	`startsAt` bigint NOT NULL,
	`endsAt` bigint NOT NULL,
	`status` enum('scheduled','live','ended','cancelled') NOT NULL DEFAULT 'scheduled',
	`winnerId` int,
	`createdAt` bigint NOT NULL,
	`updatedAt` bigint NOT NULL,
	CONSTRAINT `auctions_id` PRIMARY KEY(`id`),
	CONSTRAINT `auction_listing_unique` UNIQUE(`listingId`)
);
--> statement-breakpoint
CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorId` int,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(80) NOT NULL,
	`entityId` int,
	`detail` varchar(1000),
	`createdAt` bigint NOT NULL,
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bids` (
	`id` int AUTO_INCREMENT NOT NULL,
	`auctionId` int NOT NULL,
	`bidderId` int NOT NULL,
	`amount` decimal(16,0) NOT NULL,
	`createdAt` bigint NOT NULL,
	CONSTRAINT `bids_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`buyerId` int NOT NULL,
	`sellerId` int NOT NULL,
	`createdAt` bigint NOT NULL,
	`updatedAt` bigint NOT NULL,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`),
	CONSTRAINT `conversation_unique_pair` UNIQUE(`listingId`,`buyerId`,`sellerId`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`listingId` int NOT NULL,
	`createdAt` bigint NOT NULL,
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`),
	CONSTRAINT `favorite_user_listing_unique` UNIQUE(`userId`,`listingId`)
);
--> statement-breakpoint
CREATE TABLE `listingImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`storageKey` varchar(1024) NOT NULL,
	`url` varchar(2048) NOT NULL,
	`alt` varchar(220) NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`byteSize` int NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` bigint NOT NULL,
	CONSTRAINT `listingImages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text NOT NULL,
	`make` varchar(80) NOT NULL,
	`model` varchar(100) NOT NULL,
	`year` int NOT NULL,
	`mileage` int NOT NULL,
	`fuelType` enum('gasoline','diesel','hybrid','electric') NOT NULL,
	`transmission` enum('automatic','manual') NOT NULL,
	`bodyType` varchar(60) NOT NULL,
	`color` varchar(60),
	`condition` enum('new','excellent','good','fair','repair_needed') NOT NULL,
	`city` varchar(80) NOT NULL,
	`district` varchar(100),
	`contactPhone` varchar(32) NOT NULL,
	`showWhatsapp` boolean NOT NULL DEFAULT false,
	`allowNegotiation` boolean NOT NULL DEFAULT false,
	`saleType` enum('sale','auction') NOT NULL,
	`askingPrice` decimal(16,0),
	`status` enum('draft','pending','published','rejected','sold','archived') NOT NULL DEFAULT 'draft',
	`rejectionReason` varchar(500),
	`publishedAt` bigint,
	`createdAt` bigint NOT NULL,
	`updatedAt` bigint NOT NULL,
	CONSTRAINT `listings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderId` int NOT NULL,
	`content` text NOT NULL,
	`readAt` bigint,
	`createdAt` bigint NOT NULL,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('listing','bid','message','verification','auction') NOT NULL,
	`title` varchar(180) NOT NULL,
	`body` varchar(500) NOT NULL,
	`href` varchar(500),
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` bigint NOT NULL,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `verificationDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`documentType` enum('identity','business_registration','vehicle_ownership') NOT NULL,
	`storageKey` varchar(1024) NOT NULL,
	`url` varchar(2048) NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`byteSize` int NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewNote` varchar(500),
	`reviewedBy` int,
	`reviewedAt` bigint,
	`createdAt` bigint NOT NULL,
	CONSTRAINT `verificationDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` varchar(1024);--> statement-breakpoint
CREATE INDEX `auction_status_end_idx` ON `auctions` (`status`,`endsAt`);--> statement-breakpoint
CREATE INDEX `audit_entity_idx` ON `auditLogs` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `audit_actor_idx` ON `auditLogs` (`actorId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `bids_auction_created_idx` ON `bids` (`auctionId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `bids_bidder_idx` ON `bids` (`bidderId`);--> statement-breakpoint
CREATE INDEX `conversation_buyer_idx` ON `conversations` (`buyerId`);--> statement-breakpoint
CREATE INDEX `conversation_seller_idx` ON `conversations` (`sellerId`);--> statement-breakpoint
CREATE INDEX `favorites_listing_idx` ON `favorites` (`listingId`);--> statement-breakpoint
CREATE INDEX `listing_images_listing_idx` ON `listingImages` (`listingId`);--> statement-breakpoint
CREATE INDEX `listings_owner_idx` ON `listings` (`ownerId`);--> statement-breakpoint
CREATE INDEX `listings_status_idx` ON `listings` (`status`);--> statement-breakpoint
CREATE INDEX `listings_search_idx` ON `listings` (`make`,`model`,`city`);--> statement-breakpoint
CREATE INDEX `listings_sale_type_idx` ON `listings` (`saleType`);--> statement-breakpoint
CREATE INDEX `messages_conversation_created_idx` ON `messages` (`conversationId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `notifications_user_read_idx` ON `notifications` (`userId`,`isRead`,`createdAt`);--> statement-breakpoint
CREATE INDEX `verification_docs_user_idx` ON `verificationDocuments` (`userId`);--> statement-breakpoint
CREATE INDEX `verification_docs_status_idx` ON `verificationDocuments` (`status`);