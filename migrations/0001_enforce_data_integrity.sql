ALTER TABLE `order_ratings` RENAME COLUMN `feedback` TO `comment`;
--> statement-breakpoint
CREATE TRIGGER `cart_items_quantity_insert_check`
BEFORE INSERT ON `cart_items`
WHEN NEW.`quantity` <= 0
BEGIN
  SELECT RAISE(ABORT, 'cart item quantity must be positive');
END;
--> statement-breakpoint
CREATE TRIGGER `cart_items_quantity_update_check`
BEFORE UPDATE OF `quantity` ON `cart_items`
WHEN NEW.`quantity` <= 0
BEGIN
  SELECT RAISE(ABORT, 'cart item quantity must be positive');
END;
--> statement-breakpoint
CREATE TRIGGER `cart_items_single_restaurant_insert_check`
BEFORE INSERT ON `cart_items`
WHEN EXISTS (
  SELECT 1
  FROM `cart_items` AS current_item
  JOIN `dishes` AS current_dish ON current_dish.`id` = current_item.`dish_id`
  JOIN `dishes` AS new_dish ON new_dish.`id` = NEW.`dish_id`
  WHERE current_item.`user_id` = NEW.`user_id`
    AND current_dish.`restaurant_id` <> new_dish.`restaurant_id`
)
BEGIN
  SELECT RAISE(ABORT, 'cart may contain dishes from one restaurant only');
END;
--> statement-breakpoint
CREATE TRIGGER `cart_items_single_restaurant_update_check`
BEFORE UPDATE OF `dish_id`, `user_id` ON `cart_items`
WHEN EXISTS (
  SELECT 1
  FROM `cart_items` AS current_item
  JOIN `dishes` AS current_dish ON current_dish.`id` = current_item.`dish_id`
  JOIN `dishes` AS new_dish ON new_dish.`id` = NEW.`dish_id`
  WHERE current_item.`user_id` = NEW.`user_id`
    AND current_item.`id` <> OLD.`id`
    AND current_dish.`restaurant_id` <> new_dish.`restaurant_id`
)
BEGIN
  SELECT RAISE(ABORT, 'cart may contain dishes from one restaurant only');
END;
--> statement-breakpoint
CREATE TRIGGER `order_items_integrity_insert_check`
BEFORE INSERT ON `order_items`
WHEN NEW.`quantity` <= 0
  OR NEW.`price_at_order` < 0
  OR EXISTS (
    SELECT 1
    FROM `orders`
    JOIN `dishes` ON dishes.`id` = NEW.`dish_id`
    WHERE orders.`id` = NEW.`order_id`
      AND orders.`restaurant_id` <> dishes.`restaurant_id`
  )
BEGIN
  SELECT RAISE(ABORT, 'invalid order item');
END;
--> statement-breakpoint
CREATE TRIGGER `order_items_integrity_update_check`
BEFORE UPDATE OF `order_id`, `dish_id`, `quantity`, `price_at_order` ON `order_items`
WHEN NEW.`quantity` <= 0
  OR NEW.`price_at_order` < 0
  OR EXISTS (
    SELECT 1
    FROM `orders`
    JOIN `dishes` ON dishes.`id` = NEW.`dish_id`
    WHERE orders.`id` = NEW.`order_id`
      AND orders.`restaurant_id` <> dishes.`restaurant_id`
  )
BEGIN
  SELECT RAISE(ABORT, 'invalid order item');
END;
--> statement-breakpoint
CREATE TRIGGER `order_ratings_range_insert_check`
BEFORE INSERT ON `order_ratings`
WHEN NEW.`restaurant_rating` NOT BETWEEN 1 AND 5
  OR NEW.`delivery_rating` NOT BETWEEN 1 AND 5
BEGIN
  SELECT RAISE(ABORT, 'ratings must be between 1 and 5');
END;
--> statement-breakpoint
CREATE TRIGGER `order_ratings_range_update_check`
BEFORE UPDATE OF `restaurant_rating`, `delivery_rating` ON `order_ratings`
WHEN NEW.`restaurant_rating` NOT BETWEEN 1 AND 5
  OR NEW.`delivery_rating` NOT BETWEEN 1 AND 5
BEGIN
  SELECT RAISE(ABORT, 'ratings must be between 1 and 5');
END;
--> statement-breakpoint
CREATE TRIGGER `dishes_price_insert_check`
BEFORE INSERT ON `dishes`
WHEN NEW.`price` < 0
BEGIN
  SELECT RAISE(ABORT, 'dish price must not be negative');
END;
--> statement-breakpoint
CREATE TRIGGER `dishes_price_update_check`
BEFORE UPDATE OF `price` ON `dishes`
WHEN NEW.`price` < 0
BEGIN
  SELECT RAISE(ABORT, 'dish price must not be negative');
END;
--> statement-breakpoint
CREATE TRIGGER `orders_total_price_insert_check`
BEFORE INSERT ON `orders`
WHEN NEW.`total_price` < 0
BEGIN
  SELECT RAISE(ABORT, 'order total price must not be negative');
END;
--> statement-breakpoint
CREATE TRIGGER `orders_total_price_update_check`
BEFORE UPDATE OF `total_price` ON `orders`
WHEN NEW.`total_price` < 0
BEGIN
  SELECT RAISE(ABORT, 'order total price must not be negative');
END;
