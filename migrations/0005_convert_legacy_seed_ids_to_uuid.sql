UPDATE `users`
SET `email` = 'legacy-demo-user@yamdelish.local'
WHERE `id` = 'demo-user';
--> statement-breakpoint
INSERT OR IGNORE INTO `users` (`id`, `name`, `surname`, `email`, `password_hash`, `phone`, `address`, `created_at`, `updated_at`)
SELECT '00000000-0000-4000-8000-000000000001', `name`, `surname`, 'guest@yamdelish.local', `password_hash`, `phone`, `address`, `created_at`, `updated_at`
FROM `users`
WHERE `id` = 'demo-user';
--> statement-breakpoint
INSERT OR IGNORE INTO `restaurants` (`id`, `name`, `description`, `kitchen_type`, `delivery_time_from`, `delivery_time_to`, `average_check_from`, `average_check_to`, `rating`, `image`, `recent`, `favorite`, `created_at`, `updated_at`)
SELECT CASE `id`
  WHEN '1' THEN '10000000-0000-4000-8000-000000000001'
  WHEN '2' THEN '10000000-0000-4000-8000-000000000002'
  WHEN '3' THEN '10000000-0000-4000-8000-000000000003'
  WHEN '4' THEN '10000000-0000-4000-8000-000000000004'
  WHEN '5' THEN '10000000-0000-4000-8000-000000000005'
  WHEN '6' THEN '10000000-0000-4000-8000-000000000006'
  WHEN '7' THEN '10000000-0000-4000-8000-000000000007'
  WHEN '8' THEN '10000000-0000-4000-8000-000000000008'
END, `name`, `description`, `kitchen_type`, `delivery_time_from`, `delivery_time_to`, `average_check_from`, `average_check_to`, `rating`, `image`, `recent`, `favorite`, `created_at`, `updated_at`
FROM `restaurants`
WHERE `id` IN ('1', '2', '3', '4', '5', '6', '7', '8');
--> statement-breakpoint
INSERT OR IGNORE INTO `dishes` (`id`, `restaurant_id`, `name`, `description`, `image`, `group_name`, `price`, `created_at`, `updated_at`)
SELECT CASE `id`
  WHEN 'dish-goose-soup' THEN '20000000-0000-4000-8000-000000000001'
  WHEN 'dish-honey-cake-soup' THEN '20000000-0000-4000-8000-000000000002'
  WHEN 'dish-veal-soup' THEN '20000000-0000-4000-8000-000000000003'
  WHEN 'dish-fish-soup' THEN '20000000-0000-4000-8000-000000000004'
  WHEN 'dish-tea-main' THEN '20000000-0000-4000-8000-000000000005'
  WHEN 'dish-bun-dessert' THEN '20000000-0000-4000-8000-000000000006'
END,
CASE `restaurant_id`
  WHEN '1' THEN '10000000-0000-4000-8000-000000000001'
  WHEN '2' THEN '10000000-0000-4000-8000-000000000002'
  WHEN '3' THEN '10000000-0000-4000-8000-000000000003'
  WHEN '4' THEN '10000000-0000-4000-8000-000000000004'
  WHEN '6' THEN '10000000-0000-4000-8000-000000000006'
  WHEN '7' THEN '10000000-0000-4000-8000-000000000007'
END, `name`, `description`, `image`, `group_name`, `price`, `created_at`, `updated_at`
FROM `dishes`
WHERE `id` IN ('dish-goose-soup', 'dish-honey-cake-soup', 'dish-veal-soup', 'dish-fish-soup', 'dish-tea-main', 'dish-bun-dessert');
--> statement-breakpoint
UPDATE `cart_items`
SET `user_id` = '00000000-0000-4000-8000-000000000001'
WHERE `user_id` = 'demo-user';
--> statement-breakpoint
UPDATE `orders`
SET `user_id` = '00000000-0000-4000-8000-000000000001'
WHERE `user_id` = 'demo-user';
--> statement-breakpoint
UPDATE `orders`
SET `restaurant_id` = CASE `restaurant_id`
  WHEN '1' THEN '10000000-0000-4000-8000-000000000001'
  WHEN '2' THEN '10000000-0000-4000-8000-000000000002'
  WHEN '3' THEN '10000000-0000-4000-8000-000000000003'
  WHEN '4' THEN '10000000-0000-4000-8000-000000000004'
  WHEN '5' THEN '10000000-0000-4000-8000-000000000005'
  WHEN '6' THEN '10000000-0000-4000-8000-000000000006'
  WHEN '7' THEN '10000000-0000-4000-8000-000000000007'
  WHEN '8' THEN '10000000-0000-4000-8000-000000000008'
END
WHERE `restaurant_id` IN ('1', '2', '3', '4', '5', '6', '7', '8');
--> statement-breakpoint
UPDATE `cart_items`
SET `dish_id` = CASE `dish_id`
  WHEN 'dish-goose-soup' THEN '20000000-0000-4000-8000-000000000001'
  WHEN 'dish-honey-cake-soup' THEN '20000000-0000-4000-8000-000000000002'
  WHEN 'dish-veal-soup' THEN '20000000-0000-4000-8000-000000000003'
  WHEN 'dish-fish-soup' THEN '20000000-0000-4000-8000-000000000004'
  WHEN 'dish-tea-main' THEN '20000000-0000-4000-8000-000000000005'
  WHEN 'dish-bun-dessert' THEN '20000000-0000-4000-8000-000000000006'
END
WHERE `dish_id` IN ('dish-goose-soup', 'dish-honey-cake-soup', 'dish-veal-soup', 'dish-fish-soup', 'dish-tea-main', 'dish-bun-dessert');
--> statement-breakpoint
UPDATE `order_items`
SET `dish_id` = CASE `dish_id`
  WHEN 'dish-goose-soup' THEN '20000000-0000-4000-8000-000000000001'
  WHEN 'dish-honey-cake-soup' THEN '20000000-0000-4000-8000-000000000002'
  WHEN 'dish-veal-soup' THEN '20000000-0000-4000-8000-000000000003'
  WHEN 'dish-fish-soup' THEN '20000000-0000-4000-8000-000000000004'
  WHEN 'dish-tea-main' THEN '20000000-0000-4000-8000-000000000005'
  WHEN 'dish-bun-dessert' THEN '20000000-0000-4000-8000-000000000006'
END
WHERE `dish_id` IN ('dish-goose-soup', 'dish-honey-cake-soup', 'dish-veal-soup', 'dish-fish-soup', 'dish-tea-main', 'dish-bun-dessert');
--> statement-breakpoint
DELETE FROM `dishes`
WHERE `id` IN ('dish-goose-soup', 'dish-honey-cake-soup', 'dish-veal-soup', 'dish-fish-soup', 'dish-tea-main', 'dish-bun-dessert');
--> statement-breakpoint
DELETE FROM `restaurants`
WHERE `id` IN ('1', '2', '3', '4', '5', '6', '7', '8');
--> statement-breakpoint
DELETE FROM `users`
WHERE `id` = 'demo-user';
--> statement-breakpoint
INSERT OR IGNORE INTO `orders` (`id`, `user_id`, `restaurant_id`, `status`, `address`, `courier_name`, `courier_phone`, `payment_method`, `payment_status`, `total_price`, `created_at`, `updated_at`)
SELECT CASE `id`
  WHEN 'order-delivered-1' THEN '30000000-0000-4000-8000-000000000001'
  WHEN 'order-delivering-1' THEN '30000000-0000-4000-8000-000000000002'
  WHEN 'order-cooking-1' THEN '30000000-0000-4000-8000-000000000003'
END, `user_id`, `restaurant_id`, `status`, `address`, `courier_name`, `courier_phone`, `payment_method`, `payment_status`, `total_price`, `created_at`, `updated_at`
FROM `orders`
WHERE `id` IN ('order-delivered-1', 'order-delivering-1', 'order-cooking-1');
--> statement-breakpoint
UPDATE `order_items`
SET `order_id` = CASE `order_id`
  WHEN 'order-delivered-1' THEN '30000000-0000-4000-8000-000000000001'
  WHEN 'order-delivering-1' THEN '30000000-0000-4000-8000-000000000002'
  WHEN 'order-cooking-1' THEN '30000000-0000-4000-8000-000000000003'
END
WHERE `order_id` IN ('order-delivered-1', 'order-delivering-1', 'order-cooking-1');
--> statement-breakpoint
UPDATE `order_ratings`
SET `order_id` = '30000000-0000-4000-8000-000000000001'
WHERE `order_id` = 'order-delivered-1';
--> statement-breakpoint
DELETE FROM `orders`
WHERE `id` IN ('order-delivered-1', 'order-delivering-1', 'order-cooking-1');
--> statement-breakpoint
UPDATE `order_items`
SET `id` = CASE `id`
  WHEN 'order-item-delivered-goose' THEN '40000000-0000-4000-8000-000000000001'
  WHEN 'order-item-delivering-honey' THEN '40000000-0000-4000-8000-000000000002'
  WHEN 'order-item-cooking-bun' THEN '40000000-0000-4000-8000-000000000003'
END
WHERE `id` IN ('order-item-delivered-goose', 'order-item-delivering-honey', 'order-item-cooking-bun');
--> statement-breakpoint
UPDATE `order_ratings`
SET `id` = '50000000-0000-4000-8000-000000000001'
WHERE `id` = 'rating-delivered-1';
