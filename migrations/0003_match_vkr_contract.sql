ALTER TABLE `order_ratings` RENAME COLUMN `comment` TO `feedback`;
--> statement-breakpoint
CREATE TRIGGER `orders_status_insert_check`
BEFORE INSERT ON `orders`
WHEN NEW.`status` NOT IN ('created', 'cooking', 'delivering', 'delivered', 'canceled')
BEGIN
  SELECT RAISE(ABORT, 'invalid order status');
END;
--> statement-breakpoint
CREATE TRIGGER `orders_status_update_check`
BEFORE UPDATE OF `status` ON `orders`
WHEN NEW.`status` NOT IN ('created', 'cooking', 'delivering', 'delivered', 'canceled')
BEGIN
  SELECT RAISE(ABORT, 'invalid order status');
END;
