import { afterEach, describe, expect, it } from 'vitest'

import { resolveRequestUserId } from '@/utils/apiAuth'
import {
  cartAddRequestSchema,
  orderRatingRequestSchema,
  registerRequestSchema,
} from '@/utils/apiSchemas'
import { createSessionToken, verifySessionToken } from '@/utils/session'

describe('backend security and validation', () => {
  afterEach(() => {
    delete process.env.ALLOW_DEMO_AUTH
  })

  it('не принимает userId из query без явно включённого demo-режима', () => {
    process.env.ALLOW_DEMO_AUTH = 'false'

    expect(
      resolveRequestUserId({ query: { userId: 'another-user' }, headers: {} } as never),
    ).toBeNull()
  })

  it('определяет пользователя по подписанной cookie-сессии', () => {
    const token = createSessionToken('user-1')
    const request = {
      query: {},
      headers: { cookie: `yamdelish_session=${token}` },
    }

    expect(resolveRequestUserId(request as never)).toBe('user-1')
    expect(verifySessionToken(`${token}tampered`)).toBeNull()
  })

  it('принимает оценки только от 1 до 5', () => {
    expect(
      orderRatingRequestSchema.safeParse({
        orderId: 'order-1',
        restaurantRating: 0,
        deliveryRating: 5,
      }).success,
    ).toBe(false)

    expect(
      orderRatingRequestSchema.safeParse({
        orderId: 'order-1',
        restaurantRating: 1,
        deliveryRating: 5,
      }).success,
    ).toBe(true)
  })

  it('проверяет положительное количество блюда', () => {
    expect(cartAddRequestSchema.safeParse({ dishId: 'dish-1', quantity: 0 }).success).toBe(false)
    expect(cartAddRequestSchema.safeParse({ dishId: 'dish-1', quantity: 1 }).success).toBe(true)
  })

  it('поддерживает телефон и адрес при регистрации', () => {
    expect(
      registerRequestSchema.safeParse({
        name: 'Иван',
        surname: 'Иванов',
        email: 'ivan@example.com',
        password: 'password123',
        phone: '+7 900 000-00-00',
        address: 'Москва',
      }).success,
    ).toBe(true)
  })
})
