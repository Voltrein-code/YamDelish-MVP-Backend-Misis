import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DEMO_USER_ID } from '@/db/constants'
import loginHandler from '@/pages/api/auth/login'
import currentUserHandler from '@/pages/api/auth/me'
import registerHandler from '@/pages/api/auth/register'
import cartHandler from '@/pages/api/cart'
import menuHandler from '@/pages/api/menu'
import ordersHandler from '@/pages/api/orders'
import orderByIdHandler from '@/pages/api/orders/[id]'
import ratingHandler from '@/pages/api/orders/rating'
import restaurantsHandler from '@/pages/api/restaurants'
import userHandler from '@/pages/api/users/[id]'
import { loginUser, registerUser } from '@/services/auth'
import {
  addDishToCart,
  createOrderFromCart,
  getCurrentUser,
  getOrderDetails,
  getRestaurantMenu,
  getRestaurants,
  getUserCart,
  getUserOrders,
  getUserProfile,
  removeCartItem,
  saveOrderRating,
  updateCartItemQuantity,
  updateUserProfile,
} from '@/services/delivery'
import { HttpError } from '@/utils/httpError'

vi.mock('@/services/delivery', () => ({
  addDishToCart: vi.fn(),
  createOrderFromCart: vi.fn(),
  getCurrentUser: vi.fn(),
  getOrderDetails: vi.fn(),
  getRestaurantMenu: vi.fn(),
  getRestaurants: vi.fn(),
  getUserProfile: vi.fn(),
  getUser: vi.fn(),
  getUserCart: vi.fn(),
  getUserOrders: vi.fn(),
  removeCartItem: vi.fn(),
  saveOrderRating: vi.fn(),
  updateCartItemQuantity: vi.fn(),
  updateUserProfile: vi.fn(),
}))

vi.mock('@/services/auth', () => ({
  loginUser: vi.fn(),
  logoutUser: vi.fn(),
  registerUser: vi.fn(),
  restorePassword: vi.fn(),
}))

// API handlers тестируются как unit: база замокана, проверяем только HTTP-контракт.
const createResponse = () => {
  const res = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: undefined as unknown,
    setHeader: vi.fn((name: string, value: string) => {
      res.headers[name] = value
      return res
    }),
    status: vi.fn((code: number) => {
      res.statusCode = code
      return res
    }),
    json: vi.fn((body: unknown) => {
      res.body = body
      return res
    }),
  }

  return res
}

const emptyCart = { items: [], totalItems: 0, totalPrice: 0 }

describe('backend API handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ALLOW_DEMO_AUTH = 'true'
  })

  it('возвращает список ресторанов', async () => {
    vi.mocked(getRestaurants).mockResolvedValueOnce([
      {
        id: 'restaurant-1',
        name: 'Трапеза',
        rating: 5,
        description: 'Тест',
        kitchenType: 'Русская',
        time: '30–40 минут',
        price: '1 000–1 500 ₽',
        image: '/image.jpg',
        recent: true,
        favorite: false,
      },
    ])

    const res = createResponse()
    await restaurantsHandler({ method: 'GET' } as never, res as never)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.body).toHaveLength(1)
    expect(getRestaurants).toHaveBeenCalledOnce()
  })

  it('отклоняет неподдерживаемый метод для ресторанов', async () => {
    const res = createResponse()
    await restaurantsHandler({ method: 'POST' } as never, res as never)

    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.headers.Allow).toBe('GET')
  })

  it('требует restaurantId при загрузке меню', async () => {
    const res = createResponse()
    await menuHandler({ method: 'GET', query: {} } as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.body).toEqual({ message: 'restaurantId обязателен' })
    expect(getRestaurantMenu).not.toHaveBeenCalled()
  })

  it('создаёт подписанную httpOnly session cookie при входе', async () => {
    vi.mocked(loginUser).mockResolvedValueOnce({
      id: 'user-1',
      name: 'Иван',
      surname: 'Иванов',
      email: 'ivan@example.com',
    })

    const res = createResponse()
    await loginHandler(
      {
        method: 'POST',
        body: { email: 'ivan@example.com', password: 'password123' },
      } as never,
      res as never,
    )

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.headers['Set-Cookie']).toContain('yamdelish_session=')
    expect(res.headers['Set-Cookie']).toContain('HttpOnly')
    expect(res.headers['Set-Cookie']).toContain('SameSite=Lax')
  })

  it('создаёт пользователя и сессию при регистрации', async () => {
    vi.mocked(registerUser).mockResolvedValueOnce({
      id: 'user-1',
      name: 'Иван',
      surname: 'Иванов',
      email: 'ivan@example.com',
      phone: null,
      address: null,
    })

    const res = createResponse()
    await registerHandler(
      {
        method: 'POST',
        body: {
          name: 'Иван',
          surname: 'Иванов',
          email: 'ivan@example.com',
          password: 'password123',
        },
      } as never,
      res as never,
    )

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.headers['Set-Cookie']).toContain('yamdelish_session=')
  })

  it('возвращает текущего пользователя без password_hash', async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce({
      id: 'user-1',
      name: 'Иван',
      surname: 'Иванов',
      email: 'ivan@example.com',
      phone: null,
      address: null,
    })

    const res = createResponse()
    await currentUserHandler(
      { method: 'GET', query: { userId: 'user-1' }, headers: {} } as never,
      res as never,
    )

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.body).not.toHaveProperty('passwordHash')
  })

  it('разрешает получать только собственный профиль', async () => {
    vi.mocked(getUserProfile).mockResolvedValueOnce({
      id: 'user-1',
      name: 'Иван',
      surname: 'Иванов',
      email: 'ivan@example.com',
      phone: null,
      address: null,
    })
    vi.mocked(getUserProfile).mockRejectedValueOnce(
      new HttpError(403, 'Нет доступа к чужому профилю'),
    )

    const ownResponse = createResponse()
    await userHandler(
      { method: 'GET', query: { id: 'user-1', userId: 'user-1' } } as never,
      ownResponse as never,
    )
    expect(ownResponse.status).toHaveBeenCalledWith(200)

    const foreignResponse = createResponse()
    await userHandler(
      { method: 'GET', query: { id: 'user-2', userId: 'user-1' } } as never,
      foreignResponse as never,
    )
    expect(foreignResponse.status).toHaveBeenCalledWith(403)
    expect(getUserProfile).toHaveBeenCalledTimes(2)
    expect(getUserProfile).toHaveBeenLastCalledWith('user-2', 'user-1')
  })

  it('обновляет только разрешённые поля профиля', async () => {
    vi.mocked(updateUserProfile).mockResolvedValueOnce({
      id: 'user-1',
      name: 'Пётр',
      surname: 'Иванов',
      email: 'ivan@example.com',
      phone: null,
      address: null,
    })

    const res = createResponse()
    await userHandler(
      {
        method: 'PATCH',
        query: { id: 'user-1', userId: 'user-1' },
        body: { name: 'Пётр' },
      } as never,
      res as never,
    )
    expect(updateUserProfile).toHaveBeenCalledWith({
      userId: 'user-1',
      sessionUserId: 'user-1',
      name: 'Пётр',
    })
    expect(res.status).toHaveBeenCalledWith(200)

    const emailResponse = createResponse()
    await userHandler(
      {
        method: 'PATCH',
        query: { id: 'user-1', userId: 'user-1' },
        body: { email: 'other@example.com' },
      } as never,
      emailResponse as never,
    )
    expect(emailResponse.status).toHaveBeenCalledWith(400)
    expect(updateUserProfile).toHaveBeenCalledOnce()
  })

  it('читает корзину тестового пользователя', async () => {
    vi.mocked(getUserCart).mockResolvedValueOnce(emptyCart)

    const res = createResponse()
    await cartHandler({ method: 'GET', query: {} } as never, res as never)

    expect(getUserCart).toHaveBeenCalledWith(DEMO_USER_ID)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.body).toEqual(emptyCart)
  })

  it('требует сессию для корзины, если демонстрационный режим выключен', async () => {
    process.env.ALLOW_DEMO_AUTH = 'false'

    const res = createResponse()
    await cartHandler({ method: 'GET', query: {}, headers: {} } as never, res as never)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(getUserCart).not.toHaveBeenCalled()
  })

  it('добавляет блюдо в корзину', async () => {
    vi.mocked(addDishToCart).mockResolvedValueOnce({
      items: [{ id: 'cart-item-1' } as never],
      totalItems: 1,
      totalPrice: 100,
    })

    const res = createResponse()
    await cartHandler(
      {
        method: 'POST',
        query: { userId: 'user-1' },
        body: { dishId: 'dish-1', quantity: 2 },
      } as never,
      res as never,
    )

    expect(addDishToCart).toHaveBeenCalledWith('dish-1', 'user-1', 2)
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('обновляет количество позиции корзины', async () => {
    vi.mocked(updateCartItemQuantity).mockResolvedValueOnce(emptyCart)

    const res = createResponse()
    await cartHandler(
      {
        method: 'PATCH',
        query: { userId: 'user-1' },
        body: { cartItemId: 'cart-1', quantity: 3 },
      } as never,
      res as never,
    )

    expect(updateCartItemQuantity).toHaveBeenCalledWith('cart-1', 'user-1', 3)
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('удаляет позицию корзины', async () => {
    vi.mocked(removeCartItem).mockResolvedValueOnce(emptyCart)

    const res = createResponse()
    await cartHandler(
      {
        method: 'DELETE',
        query: { userId: 'user-1', cartItemId: 'cart-1' },
      } as never,
      res as never,
    )

    expect(removeCartItem).toHaveBeenCalledWith('cart-1', 'user-1')
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('создаёт заказ из корзины', async () => {
    vi.mocked(createOrderFromCart).mockResolvedValueOnce({ id: 'order-1' } as never)

    const res = createResponse()
    await ordersHandler(
      {
        method: 'POST',
        query: { userId: 'user-1' },
        body: { userId: 'user-1', address: 'ул. Тестовая, 1', paymentMethod: 'Карта' },
      } as never,
      res as never,
    )

    expect(createOrderFromCart).toHaveBeenCalledWith({
      userId: 'user-1',
      address: 'ул. Тестовая, 1',
      paymentMethod: 'Карта',
    })
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('позволяет оформить заказ с адресом из профиля', async () => {
    vi.mocked(createOrderFromCart).mockResolvedValueOnce({ id: 'order-from-profile' } as never)

    const res = createResponse()
    await ordersHandler(
      {
        method: 'POST',
        query: { userId: 'user-1' },
        body: { userId: 'user-1', address: '', paymentMethod: 'Карта' },
      } as never,
      res as never,
    )

    expect(createOrderFromCart).toHaveBeenCalledWith({
      userId: 'user-1',
      address: '',
      paymentMethod: 'Карта',
    })
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('возвращает историю заказов', async () => {
    vi.mocked(getUserOrders).mockResolvedValueOnce([{ id: 'order-1' } as never])

    const res = createResponse()
    await ordersHandler({ method: 'GET', query: { userId: 'user-1' } } as never, res as never)

    expect(getUserOrders).toHaveBeenCalledWith('user-1')
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('возвращает заказ по id', async () => {
    vi.mocked(getOrderDetails).mockResolvedValueOnce({
      id: 'order-1',
      status: 'delivered',
    } as never)

    const res = createResponse()
    await orderByIdHandler(
      { method: 'GET', query: { id: 'order-1', userId: 'user-1' } } as never,
      res as never,
    )

    expect(getOrderDetails).toHaveBeenCalledWith('order-1', 'user-1')
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('возвращает 404, если заказ не найден', async () => {
    vi.mocked(getOrderDetails).mockResolvedValueOnce(null)

    const res = createResponse()
    await orderByIdHandler(
      { method: 'GET', query: { id: 'missing', userId: 'user-1' } } as never,
      res as never,
    )

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('возвращает 403 при запросе чужого заказа', async () => {
    vi.mocked(getOrderDetails).mockRejectedValueOnce(
      new HttpError(403, 'Нет доступа к чужому заказу'),
    )

    const res = createResponse()
    await orderByIdHandler(
      { method: 'GET', query: { id: 'order-2', userId: 'user-1' } } as never,
      res as never,
    )

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.body).toEqual({ message: 'Нет доступа к чужому заказу' })
  })

  it('сохраняет оценку заказа', async () => {
    vi.mocked(saveOrderRating).mockResolvedValueOnce({ id: 'rating-1' } as never)

    const res = createResponse()
    await ratingHandler(
      {
        method: 'POST',
        query: { userId: 'user-1' },
        body: {
          orderId: 'order-1',
          restaurantRating: 5,
          deliveryRating: 4,
          comment: 'Хорошо',
        },
      } as never,
      res as never,
    )

    expect(saveOrderRating).toHaveBeenCalledWith({
      userId: 'user-1',
      orderId: 'order-1',
      restaurantRating: 5,
      deliveryRating: 4,
      comment: 'Хорошо',
    })
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('возвращает 409 при повторной оценке заказа', async () => {
    vi.mocked(saveOrderRating).mockRejectedValueOnce(new HttpError(409, 'Заказ уже оценён'))

    const res = createResponse()
    await ratingHandler(
      {
        method: 'POST',
        query: { userId: 'user-1' },
        body: {
          orderId: 'order-1',
          restaurantRating: 5,
          deliveryRating: 4,
        },
      } as never,
      res as never,
    )

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.body).toEqual({ message: 'Заказ уже оценён' })
  })

  it('не позволяет оценить недоставленный заказ', async () => {
    vi.mocked(saveOrderRating).mockRejectedValueOnce(
      new HttpError(409, 'Оценка доступна после доставки заказа'),
    )

    const res = createResponse()
    await ratingHandler(
      {
        method: 'POST',
        query: { userId: 'user-1' },
        body: {
          orderId: 'order-1',
          restaurantRating: 5,
          deliveryRating: 4,
        },
      } as never,
      res as never,
    )

    expect(res.status).toHaveBeenCalledWith(409)
    expect(saveOrderRating).toHaveBeenCalledOnce()
  })
})
