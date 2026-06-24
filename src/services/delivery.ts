import { and, desc, eq, sql } from 'drizzle-orm'

import { db } from '@/db'
import { DEMO_USER_ID } from '@/db/constants'
import {
  cartItems,
  dishes,
  orderItems,
  orderRatings,
  orders,
  restaurants,
  users,
} from '@/db/schema'
import { HttpError } from '@/utils/httpError'
import { hashPassword } from '@/utils/password'

export { DEMO_USER_ID }

export const formatPriceRange = (from: number, to: number) =>
  `${from.toLocaleString('ru-RU')}–${to.toLocaleString('ru-RU')} ₽`

export const formatDeliveryTime = (from: number, to: number) => `${from}–${to} минут`

export const formatDishPrice = (price: number) => `${price} ₽`

// DTO держат контракт фронтенда стабильным, даже если структура таблиц меняется.
export const toRestaurantDto = (restaurant: typeof restaurants.$inferSelect) => ({
  id: restaurant.id,
  name: restaurant.name,
  rating: restaurant.rating,
  description: restaurant.description,
  kitchenType: restaurant.kitchenType,
  time: formatDeliveryTime(restaurant.deliveryTimeFrom, restaurant.deliveryTimeTo),
  price: formatPriceRange(restaurant.averageCheckFrom, restaurant.averageCheckTo),
  image: restaurant.image,
  recent: restaurant.recent,
  favorite: restaurant.favorite,
})

export const toMenuDto = (dish: typeof dishes.$inferSelect) => ({
  id: dish.id,
  restaurantId: dish.restaurantId,
  name: dish.name,
  price: formatDishPrice(dish.price),
  description: dish.description,
  image: dish.image,
  group: dish.group,
})

export const toCartDto = (
  row: typeof cartItems.$inferSelect & {
    dish: typeof dishes.$inferSelect
  },
) => ({
  id: row.id,
  dishId: row.dishId,
  restaurantId: row.dish.restaurantId,
  name: row.dish.name,
  price: String(row.dish.price * row.quantity),
  pricePerItem: row.dish.price,
  quantity: row.quantity,
  description: row.dish.description,
  image: row.dish.image,
  group: row.dish.group,
})

export const toUserDto = (user: typeof users.$inferSelect) => ({
  id: user.id,
  name: user.name,
  surname: user.surname,
  email: user.email,
  phone: user.phone,
  address: user.address,
})

export const toOrderDto = (
  order: typeof orders.$inferSelect & {
    restaurant: typeof restaurants.$inferSelect
    items: Array<typeof orderItems.$inferSelect & { dish: typeof dishes.$inferSelect }>
    rating?: typeof orderRatings.$inferSelect | null
  },
) => ({
  id: order.id,
  date: order.createdAt.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
  time: order.createdAt.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }),
  status: order.status,
  statusLabel: getOrderStatusLabel(order.status),
  restaurantId: order.restaurantId,
  restaurantName: order.restaurant.name,
  address: order.address,
  courierName: order.courierName,
  courierPhone: order.courierPhone,
  paymentMethod: order.paymentMethod,
  paymentStatus: order.paymentStatus,
  totalPrice: order.totalPrice,
  totalPriceLabel: `${order.totalPrice.toLocaleString('ru-RU')} ₽`,
  rating: order.rating
    ? {
        ...order.rating,
        comment: order.rating.feedback,
      }
    : null,
  items: order.items.map(item => ({
    id: item.id,
    dishId: item.dishId,
    name: item.dish.name,
    quantity: item.quantity,
    price: item.price,
    priceAtOrder: item.priceAtOrder,
    priceLabel: `${(item.priceAtOrder * item.quantity).toLocaleString('ru-RU')} ₽`,
  })),
})

export const getOrderStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    created: 'Создан',
    cooking: 'Готовится',
    delivering: 'В доставке',
    delivered: 'Доставлен',
    canceled: 'Отменён',
  }

  return labels[status] ?? status
}

export const ensureDemoUser = async () => {
  const existing = await db.query.users.findFirst({
    where: eq(users.id, DEMO_USER_ID),
  })

  if (existing) return existing

  const inserted = await db
    .insert(users)
    .values({
      id: DEMO_USER_ID,
      name: 'Гость',
      surname: 'YamDelish',
      email: 'guest@yamdelish.local',
      passwordHash: hashPassword('password123'),
    })
    .returning()

  return inserted[0]
}

export const getRestaurants = async () => {
  const list = await db.select().from(restaurants)
  return list.map(toRestaurantDto)
}

export const getRestaurantMenu = async (restaurantId: string) => {
  const rows = await db.select().from(dishes).where(eq(dishes.restaurantId, restaurantId))

  return rows.map(toMenuDto)
}

export const getUserCart = async (userId = DEMO_USER_ID) => {
  await ensureDemoUser()

  const rows = await db.query.cartItems.findMany({
    where: eq(cartItems.userId, userId),
    with: {
      dish: true,
    },
  })

  const items = rows.map(toCartDto)

  return {
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + Number(item.price), 0),
  }
}

export const getUser = async (userId = DEMO_USER_ID) => {
  await ensureDemoUser()

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })

  if (!user) return null

  return toUserDto(user)
}

export const updateUserProfile = async ({
  userId,
  sessionUserId,
  name,
  surname,
  phone,
  address,
}: {
  userId: string
  sessionUserId: string
  name?: string
  surname?: string
  phone?: string | null
  address?: string | null
}) => {
  if (userId !== sessionUserId) throw new HttpError(403, 'Нет доступа к чужому профилю')

  await ensureDemoUser()

  const updated = await db
    .update(users)
    .set({
      ...(name ? { name } : {}),
      ...(surname ? { surname } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(address !== undefined ? { address } : {}),
      updatedAt: sql`(unixepoch())`,
    })
    .where(eq(users.id, userId))
    .returning()

  return updated[0] ? toUserDto(updated[0]) : null
}

export const addDishToCart = async (dishId: string, userId = DEMO_USER_ID, quantity = 1) => {
  await ensureDemoUser()

  await db.transaction(async tx => {
    const dish = await tx.query.dishes.findFirst({
      where: eq(dishes.id, dishId),
    })

    if (!dish) {
      throw new HttpError(404, 'Блюдо не найдено')
    }

    const currentCartItem = await tx.query.cartItems.findFirst({
      where: eq(cartItems.userId, userId),
      with: { dish: true },
    })

    if (currentCartItem && currentCartItem.dish.restaurantId !== dish.restaurantId) {
      throw new HttpError(409, 'В корзине могут быть блюда только одного ресторана')
    }

    const existing = await tx.query.cartItems.findFirst({
      where: and(eq(cartItems.userId, userId), eq(cartItems.dishId, dishId)),
    })

    if (existing) {
      await tx
        .update(cartItems)
        .set({
          quantity: existing.quantity + quantity,
          updatedAt: sql`(unixepoch())`,
        })
        .where(eq(cartItems.id, existing.id))
      return
    }

    await tx.insert(cartItems).values({
      userId,
      dishId,
      quantity,
    })
  })

  return getUserCart(userId)
}

export const updateCartItemQuantity = async (
  cartItemId: string,
  userId = DEMO_USER_ID,
  quantity: number,
) => {
  const item = await db.query.cartItems.findFirst({
    where: eq(cartItems.id, cartItemId),
  })

  if (!item) throw new HttpError(404, 'Позиция корзины не найдена')
  if (item.userId !== userId) throw new HttpError(403, 'Нет доступа к чужой корзине')

  if (quantity <= 0) {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, userId)))
    return getUserCart(userId)
  }

  await db
    .update(cartItems)
    .set({
      quantity,
      updatedAt: sql`(unixepoch())`,
    })
    .where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, userId)))

  return getUserCart(userId)
}

export const removeCartItem = async (cartItemId: string, userId = DEMO_USER_ID) => {
  const item = await db.query.cartItems.findFirst({
    where: eq(cartItems.id, cartItemId),
  })

  if (!item) throw new HttpError(404, 'Позиция корзины не найдена')
  if (item.userId !== userId) throw new HttpError(403, 'Нет доступа к чужой корзине')

  await db.delete(cartItems).where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, userId)))
  return getUserCart(userId)
}

export const createOrderFromCart = async ({
  userId = DEMO_USER_ID,
  address,
  paymentMethod,
}: {
  userId?: string
  address: string
  paymentMethod: string
}) => {
  await ensureDemoUser()

  const orderId = await db.transaction(async tx => {
    const cart = await tx.query.cartItems.findMany({
      where: eq(cartItems.userId, userId),
      with: {
        dish: true,
      },
    })

    if (cart.length === 0) {
      throw new HttpError(400, 'Корзина пуста')
    }

    const user = await tx.query.users.findFirst({
      where: eq(users.id, userId),
    })

    const deliveryAddress = address.trim() || user?.address

    if (!deliveryAddress) {
      throw new HttpError(400, 'Укажите адрес доставки')
    }

    const restaurantId = cart[0].dish.restaurantId
    const hasDifferentRestaurant = cart.some(item => item.dish.restaurantId !== restaurantId)

    if (hasDifferentRestaurant) {
      throw new HttpError(409, 'Корзина содержит блюда из разных ресторанов')
    }

    const totalPrice = cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0)

    const createdOrder = await tx
      .insert(orders)
      .values({
        userId,
        restaurantId,
        address: deliveryAddress,
        paymentMethod,
        totalPrice,
      })
      .returning()

    const order = createdOrder[0]

    // Фиксируем цену блюда на момент заказа, чтобы история не менялась при обновлении меню.
    await tx.insert(orderItems).values(
      cart.map(item => ({
        orderId: order.id,
        dishId: item.dishId,
        quantity: item.quantity,
        priceAtOrder: item.dish.price,
      })),
    )

    await tx.delete(cartItems).where(eq(cartItems.userId, userId))

    return order.id
  })

  const order = await getOrderDetails(orderId, userId)

  if (!order) throw new HttpError(500, 'Созданный заказ не найден')
  return order
}

export const getUserOrders = async (userId = DEMO_USER_ID) => {
  await ensureDemoUser()

  const rows = await db.query.orders.findMany({
    where: eq(orders.userId, userId),
    orderBy: desc(orders.createdAt),
    with: {
      restaurant: true,
      items: {
        with: {
          dish: true,
        },
      },
      rating: true,
    },
  })

  return rows.map(toOrderDto)
}

export const getOrderDetails = async (orderId: string, userId: string) => {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      restaurant: true,
      items: {
        with: {
          dish: true,
        },
      },
      rating: true,
    },
  })

  if (!order) return null
  if (order.userId !== userId) throw new HttpError(403, 'Нет доступа к чужому заказу')

  return toOrderDto(order)
}

const createOrderRating = async ({
  orderId,
  restaurantRating,
  deliveryRating,
  comment,
}: {
  orderId: string
  restaurantRating: number
  deliveryRating: number
  comment?: string
}) => {
  const rating = await db
    .insert(orderRatings)
    .values({
      orderId,
      restaurantRating,
      deliveryRating,
      feedback: comment,
    })
    .onConflictDoNothing({
      target: orderRatings.orderId,
    })
    .returning()

  if (!rating[0]) {
    throw new HttpError(409, 'Заказ уже оценён')
  }

  return rating[0]
}

export const saveOrderRating = async ({
  userId,
  orderId,
  restaurantRating,
  deliveryRating,
  comment,
}: {
  userId: string
  orderId: string
  restaurantRating: number
  deliveryRating: number
  comment?: string
}) => {
  const order = await getOrderDetails(orderId, userId)

  if (!order) throw new HttpError(404, 'Заказ не найден')
  if (order.status !== 'delivered') {
    throw new HttpError(409, 'Оценка доступна после доставки заказа')
  }

  return createOrderRating({ orderId, restaurantRating, deliveryRating, comment })
}

export const getUserProfile = async (userId: string, sessionUserId: string) => {
  if (userId !== sessionUserId) throw new HttpError(403, 'Нет доступа к чужому профилю')
  return getUser(userId)
}
export const getCurrentUser = getUser
