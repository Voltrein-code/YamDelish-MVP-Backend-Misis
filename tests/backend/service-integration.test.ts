import { readFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { createClient } from '@libsql/client'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

const databasePath = path.resolve('/tmp', `yamdelish-services-${Date.now()}.db`)
const databaseUrl = `file:${databasePath}`
const migrationClient = createClient({ url: databaseUrl })

const applyMigration = async (fileName: string) => {
  const migration = readFileSync(path.resolve(process.cwd(), 'migrations', fileName), 'utf8')
  for (const statement of migration.split('--> statement-breakpoint').map(value => value.trim())) {
    if (statement) await migrationClient.execute(statement)
  }
}

describe.sequential('service layer integration', () => {
  let auth: typeof import('@/services/auth')
  let delivery: typeof import('@/services/delivery')
  let appClient: (typeof import('@/db'))['client']
  let userId: string
  let orderId: string

  beforeAll(async () => {
    await applyMigration('0000_brainy_human_robot.sql')
    await applyMigration('0001_enforce_data_integrity.sql')
    await applyMigration('0002_align_vkr_schema.sql')
    await applyMigration('0003_match_vkr_contract.sql')
    await applyMigration('0004_add_vkr_compatibility_aliases.sql')
    await applyMigration('0005_convert_legacy_seed_ids_to_uuid.sql')

    await migrationClient.batch(
      [
        "INSERT INTO users (id,name,surname,email,password_hash) VALUES ('another-user','Другой','Пользователь','other@example.com','hash')",
        "INSERT INTO restaurants (id,name,description,kitchen_type,delivery_time_from,delivery_time_to,average_check_from,average_check_to,rating,image) VALUES ('restaurant-1','Первый','Описание','Русская',10,20,100,200,5,'/1.jpg')",
        "INSERT INTO restaurants (id,name,description,kitchen_type,delivery_time_from,delivery_time_to,average_check_from,average_check_to,rating,image) VALUES ('restaurant-2','Второй','Описание','Азиатская',20,30,200,300,4,'/2.jpg')",
        "INSERT INTO dishes (id,restaurant_id,name,description,image,group_name,price) VALUES ('dish-1','restaurant-1','Блюдо 1','Описание','/1.jpg','Основное',100)",
        "INSERT INTO dishes (id,restaurant_id,name,description,image,group_name,price) VALUES ('dish-2','restaurant-2','Блюдо 2','Описание','/2.jpg','Основное',200)",
      ],
      'write',
    )

    process.env.TURSO_DATABASE_URL = databaseUrl
    vi.resetModules()
    auth = await import('@/services/auth')
    delivery = await import('@/services/delivery')
    appClient = (await import('@/db')).client
  })

  afterAll(() => {
    appClient?.close()
    migrationClient.close()
    delete process.env.TURSO_DATABASE_URL
    rmSync(databasePath, { force: true })
  })

  it('регистрирует пользователя, хеширует пароль и выполняет вход', async () => {
    const user = await auth.registerUser({
      name: 'Иван',
      surname: 'Иванов',
      email: 'ivan@example.com',
      password: 'password123',
      phone: '+7 900 000-00-00',
      address: 'Москва, Тестовая, 1',
    })

    expect(user).toBeTruthy()
    userId = user!.id
    expect(
      await auth.registerUser({
        name: 'Иван',
        surname: 'Иванов',
        email: 'ivan@example.com',
        password: 'password123',
      }),
    ).toBeNull()
    expect(await auth.loginUser('ivan@example.com', 'password123')).toMatchObject({ id: userId })
    expect(await auth.loginUser('ivan@example.com', 'wrong-password')).toBeNull()

    const stored = await migrationClient.execute({
      sql: 'SELECT password_hash FROM users WHERE id = ?',
      args: [userId],
    })
    expect(String(stored.rows[0].password_hash)).not.toBe('password123')
  })

  it('получает справочники и обновляет только выбранный профиль', async () => {
    expect(await delivery.getRestaurants()).toHaveLength(2)
    expect(await delivery.getRestaurantMenu('restaurant-1')).toHaveLength(1)
    const currentUser = await delivery.getCurrentUser(userId)
    expect(currentUser).toMatchObject({ email: 'ivan@example.com' })
    expect(currentUser).not.toHaveProperty('passwordHash')

    const updated = await delivery.updateUserProfile({
      userId,
      sessionUserId: userId,
      name: 'Пётр',
    })
    expect(updated).toMatchObject({ id: userId, name: 'Пётр' })
    expect(await delivery.getUserProfile(userId, userId)).toMatchObject({ name: 'Пётр' })
    await expect(delivery.getUserProfile(userId, 'another-user')).rejects.toMatchObject({
      statusCode: 403,
    })
    await expect(
      delivery.updateUserProfile({
        userId,
        sessionUserId: 'another-user',
        name: 'Чужое изменение',
      }),
    ).rejects.toMatchObject({ statusCode: 403 })
  })

  it('управляет корзиной, считает итог и запрещает смешивать рестораны', async () => {
    expect(await delivery.getUserCart(userId)).toEqual({ items: [], totalItems: 0, totalPrice: 0 })

    await delivery.addDishToCart('dish-1', userId, 1)
    const cart = await delivery.addDishToCart('dish-1', userId, 2)
    expect(cart).toMatchObject({ totalItems: 3, totalPrice: 300 })
    expect(cart.items).toHaveLength(1)

    await expect(delivery.addDishToCart('dish-2', userId, 1)).rejects.toMatchObject({
      statusCode: 409,
    })

    const updated = await delivery.updateCartItemQuantity(cart.items[0].id!, userId, 2)
    expect(updated).toMatchObject({ totalItems: 2, totalPrice: 200 })

    expect(await delivery.removeCartItem(cart.items[0].id!, userId)).toEqual({
      items: [],
      totalItems: 0,
      totalPrice: 0,
    })
    expect(await delivery.addDishToCart('dish-1', userId, 2)).toMatchObject({
      totalItems: 2,
      totalPrice: 200,
    })

    await migrationClient.execute(
      "INSERT INTO cart_items (id,user_id,dish_id,quantity) VALUES ('another-cart','another-user','dish-1',1)",
    )
    await expect(delivery.updateCartItemQuantity('another-cart', userId, 2)).rejects.toMatchObject({
      statusCode: 403,
    })
    await expect(delivery.removeCartItem('another-cart', userId)).rejects.toMatchObject({
      statusCode: 403,
    })
  })

  it('откатывает оформление заказа при ошибке сохранения позиции', async () => {
    await migrationClient.execute(`
      CREATE TRIGGER fail_order_item_for_test
      BEFORE INSERT ON order_items
      BEGIN
        SELECT RAISE(ABORT, 'forced order item failure');
      END
    `)

    const before = await migrationClient.execute('SELECT COUNT(*) AS count FROM orders')
    await expect(
      delivery.createOrderFromCart({ userId, address: '', paymentMethod: 'card' }),
    ).rejects.toThrow('forced order item failure')
    const after = await migrationClient.execute('SELECT COUNT(*) AS count FROM orders')

    expect(Number(after.rows[0].count)).toBe(Number(before.rows[0].count))
    expect((await delivery.getUserCart(userId)).totalItems).toBe(2)
    await migrationClient.execute('DROP TRIGGER fail_order_item_for_test')
  })

  it('оформляет заказ, фиксирует цену, очищает корзину и возвращает историю', async () => {
    const order = await delivery.createOrderFromCart({
      userId,
      address: '',
      paymentMethod: 'card',
    })
    orderId = order.id

    expect(order).toMatchObject({
      id: orderId,
      restaurantName: 'Первый',
      totalPrice: 200,
      items: [{ quantity: 2, price: 100, priceAtOrder: 100 }],
    })

    expect(await delivery.getUserCart(userId)).toEqual({ items: [], totalItems: 0, totalPrice: 0 })
    expect(await delivery.getUserOrders(userId)).toHaveLength(1)
    expect(await delivery.getOrderDetails(orderId, userId)).toMatchObject({
      id: orderId,
      totalPrice: 200,
      items: [{ quantity: 2, priceAtOrder: 100 }],
    })
    await expect(delivery.getOrderDetails(orderId, 'another-user')).rejects.toMatchObject({
      statusCode: 403,
    })
    await expect(
      delivery.createOrderFromCart({ userId, address: '', paymentMethod: 'card' }),
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  it('сохраняет только одну оценку доставленного заказа', async () => {
    await migrationClient.execute({
      sql: "UPDATE orders SET status = 'delivered' WHERE id = ?",
      args: [orderId],
    })

    await expect(
      delivery.saveOrderRating({
        userId: 'another-user',
        orderId,
        restaurantRating: 5,
        deliveryRating: 5,
      }),
    ).rejects.toMatchObject({ statusCode: 403 })

    expect(
      await delivery.saveOrderRating({
        userId,
        orderId,
        restaurantRating: 5,
        deliveryRating: 4,
        comment: 'Отлично',
      }),
    ).toMatchObject({ orderId, restaurantRating: 5, deliveryRating: 4 })

    await expect(
      delivery.saveOrderRating({
        userId,
        orderId,
        restaurantRating: 4,
        deliveryRating: 4,
      }),
    ).rejects.toMatchObject({ statusCode: 409 })
  })
})
