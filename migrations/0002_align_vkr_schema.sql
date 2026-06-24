CREATE INDEX `cart_items_user_id_idx` ON `cart_items` (`user_id`);
--> statement-breakpoint
CREATE INDEX `cart_items_dish_id_idx` ON `cart_items` (`dish_id`);
--> statement-breakpoint
DROP TRIGGER IF EXISTS `order_items_integrity_insert_check`;
--> statement-breakpoint
DROP TRIGGER IF EXISTS `order_items_integrity_update_check`;
--> statement-breakpoint
CREATE TABLE `order_items_v2` (
  `id` text PRIMARY KEY NOT NULL,
  `order_id` text NOT NULL,
  `dish_id` text NOT NULL,
  `quantity` integer NOT NULL CHECK (`quantity` > 0),
  `price_at_order` integer NOT NULL CHECK (`price_at_order` >= 0),
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch()) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`dish_id`) REFERENCES `dishes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `order_items_v2` (`id`, `order_id`, `dish_id`, `quantity`, `price_at_order`, `created_at`, `updated_at`)
SELECT `id`, `order_id`, `dish_id`, `quantity`, `price_at_order`, unixepoch(), unixepoch()
FROM `order_items`;
--> statement-breakpoint
DROP TABLE `order_items`;
--> statement-breakpoint
ALTER TABLE `order_items_v2` RENAME TO `order_items`;
--> statement-breakpoint
CREATE INDEX `order_items_order_id_idx` ON `order_items` (`order_id`);
--> statement-breakpoint
CREATE TRIGGER `order_items_restaurant_insert_check`
BEFORE INSERT ON `order_items`
WHEN EXISTS (
  SELECT 1
  FROM `orders`
  JOIN `dishes` ON dishes.`id` = NEW.`dish_id`
  WHERE orders.`id` = NEW.`order_id`
    AND orders.`restaurant_id` <> dishes.`restaurant_id`
)
BEGIN
  SELECT RAISE(ABORT, 'order item restaurant must match order restaurant');
END;
--> statement-breakpoint
CREATE TRIGGER `order_items_restaurant_update_check`
BEFORE UPDATE OF `order_id`, `dish_id` ON `order_items`
WHEN EXISTS (
  SELECT 1
  FROM `orders`
  JOIN `dishes` ON dishes.`id` = NEW.`dish_id`
  WHERE orders.`id` = NEW.`order_id`
    AND orders.`restaurant_id` <> dishes.`restaurant_id`
)
BEGIN
  SELECT RAISE(ABORT, 'order item restaurant must match order restaurant');
END;
--> statement-breakpoint
DROP TRIGGER IF EXISTS `order_ratings_range_insert_check`;
--> statement-breakpoint
DROP TRIGGER IF EXISTS `order_ratings_range_update_check`;
--> statement-breakpoint
CREATE TABLE `order_ratings_v2` (
  `id` text PRIMARY KEY NOT NULL,
  `order_id` text NOT NULL,
  `restaurant_rating` integer NOT NULL CHECK (`restaurant_rating` BETWEEN 1 AND 5),
  `delivery_rating` integer NOT NULL CHECK (`delivery_rating` BETWEEN 1 AND 5),
  `comment` text,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch()) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `order_ratings_v2` (`id`, `order_id`, `restaurant_rating`, `delivery_rating`, `comment`, `created_at`, `updated_at`)
SELECT `id`, `order_id`, `restaurant_rating`, `delivery_rating`, `comment`, `created_at`, `created_at`
FROM `order_ratings`;
--> statement-breakpoint
DROP TABLE `order_ratings`;
--> statement-breakpoint
ALTER TABLE `order_ratings_v2` RENAME TO `order_ratings`;
--> statement-breakpoint
CREATE UNIQUE INDEX `order_ratings_order_id_unique` ON `order_ratings` (`order_id`);
