import { relations, sql } from 'drizzle-orm'
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { v4 as uuid } from 'uuid'

export const orderStatuses = ['created', 'cooking', 'delivering', 'delivered', 'canceled'] as const

export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey().$defaultFn(uuid),
    name: text('name').notNull(),
    surname: text('surname').notNull(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    phone: text('phone'),
    address: text('address'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  table => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
  }),
)

export const restaurants = sqliteTable('restaurants', {
  id: text('id').primaryKey().$defaultFn(uuid),
  name: text('name').notNull(),
  description: text('description').notNull(),
  kitchenType: text('kitchen_type').notNull(),
  deliveryTimeFrom: integer('delivery_time_from').notNull(),
  deliveryTimeTo: integer('delivery_time_to').notNull(),
  averageCheckFrom: integer('average_check_from').notNull(),
  averageCheckTo: integer('average_check_to').notNull(),
  rating: integer('rating').notNull().default(0),
  image: text('image').notNull(),
  recent: integer('recent', { mode: 'boolean' }).notNull().default(false),
  favorite: integer('favorite', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const dishes = sqliteTable(
  'dishes',
  {
    id: text('id').primaryKey().$defaultFn(uuid),
    restaurantId: text('restaurant_id')
      .notNull()
      .references(() => restaurants.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description').notNull(),
    image: text('image').notNull(),
    group: text('group_name').notNull(),
    price: integer('price').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  table => ({
    restaurantIdx: index('dishes_restaurant_id_idx').on(table.restaurantId),
    priceCheck: check('dishes_price_check', sql`${table.price} >= 0`),
  }),
)

export const cartItems = sqliteTable(
  'cart_items',
  {
    id: text('id').primaryKey().$defaultFn(uuid),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    dishId: text('dish_id')
      .notNull()
      .references(() => dishes.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(1),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  table => ({
    cartUserDishIdx: uniqueIndex('cart_items_user_dish_idx').on(table.userId, table.dishId),
    cartUserIdx: index('cart_items_user_id_idx').on(table.userId),
    cartDishIdx: index('cart_items_dish_id_idx').on(table.dishId),
    quantityCheck: check('cart_items_quantity_check', sql`${table.quantity} > 0`),
  }),
)

export const orders = sqliteTable(
  'orders',
  {
    id: text('id').primaryKey().$defaultFn(uuid),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    restaurantId: text('restaurant_id')
      .notNull()
      .references(() => restaurants.id),
    status: text('status', { enum: orderStatuses }).notNull().default('created'),
    address: text('address').notNull(),
    courierName: text('courier_name'),
    courierPhone: text('courier_phone'),
    paymentMethod: text('payment_method').notNull(),
    paymentStatus: text('payment_status').notNull().default('pending'),
    totalPrice: integer('total_price').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  table => ({
    orderUserIdx: index('orders_user_id_idx').on(table.userId),
    orderRestaurantIdx: index('orders_restaurant_id_idx').on(table.restaurantId),
    statusCheck: check(
      'orders_status_check',
      sql`${table.status} in ('created', 'cooking', 'delivering', 'delivered', 'canceled')`,
    ),
    totalPriceCheck: check('orders_total_price_check', sql`${table.totalPrice} >= 0`),
  }),
)

export const orderItems = sqliteTable(
  'order_items',
  {
    id: text('id').primaryKey().$defaultFn(uuid),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    dishId: text('dish_id')
      .notNull()
      .references(() => dishes.id),
    quantity: integer('quantity').notNull(),
    priceAtOrder: integer('price_at_order').notNull(),
    price: integer('price')
      .notNull()
      .generatedAlwaysAs(sql`price_at_order`, { mode: 'virtual' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  table => ({
    orderItemOrderIdx: index('order_items_order_id_idx').on(table.orderId),
    quantityCheck: check('order_items_quantity_check', sql`${table.quantity} > 0`),
    priceCheck: check('order_items_price_check', sql`${table.priceAtOrder} >= 0`),
  }),
)

export const orderRatings = sqliteTable(
  'order_ratings',
  {
    id: text('id').primaryKey().$defaultFn(uuid),
    orderId: text('order_id')
      .notNull()
      .unique()
      .references(() => orders.id, { onDelete: 'cascade' }),
    restaurantRating: integer('restaurant_rating').notNull(),
    deliveryRating: integer('delivery_rating').notNull(),
    feedback: text('feedback'),
    comment: text('comment').generatedAlwaysAs(sql`feedback`, { mode: 'virtual' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  table => ({
    restaurantRatingCheck: check(
      'order_ratings_restaurant_rating_check',
      sql`${table.restaurantRating} between 1 and 5`,
    ),
    deliveryRatingCheck: check(
      'order_ratings_delivery_rating_check',
      sql`${table.deliveryRating} between 1 and 5`,
    ),
  }),
)

export const usersRelations = relations(users, ({ many }) => ({
  cartItems: many(cartItems),
  orders: many(orders),
}))

export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  dishes: many(dishes),
  orders: many(orders),
}))

export const dishesRelations = relations(dishes, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [dishes.restaurantId],
    references: [restaurants.id],
  }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}))

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  dish: one(dishes, {
    fields: [cartItems.dishId],
    references: [dishes.id],
  }),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  restaurant: one(restaurants, {
    fields: [orders.restaurantId],
    references: [restaurants.id],
  }),
  items: many(orderItems),
  rating: one(orderRatings),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  dish: one(dishes, {
    fields: [orderItems.dishId],
    references: [dishes.id],
  }),
}))

export const orderRatingsRelations = relations(orderRatings, ({ one }) => ({
  order: one(orders, {
    fields: [orderRatings.orderId],
    references: [orders.id],
  }),
}))
