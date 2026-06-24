ALTER TABLE `order_items`
ADD COLUMN `price` integer NOT NULL GENERATED ALWAYS AS (`price_at_order`) VIRTUAL;
--> statement-breakpoint
ALTER TABLE `order_ratings`
ADD COLUMN `comment` text GENERATED ALWAYS AS (`feedback`) VIRTUAL;
