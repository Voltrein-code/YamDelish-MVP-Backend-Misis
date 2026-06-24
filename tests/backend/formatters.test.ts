import { describe, expect, it } from 'vitest'

import {
  formatDeliveryTime,
  formatDishPrice,
  formatPriceRange,
  getOrderStatusLabel,
  toCartDto,
  toMenuDto,
  toOrderDto,
  toRestaurantDto,
} from '@/services/delivery'
import { hashPassword, verifyPassword } from '@/utils/password'

describe('backend formatters and DTO', () => {
  it('форматирует цены и время доставки для русской локали', () => {
    expect(formatPriceRange(1500, 2500)).toBe('1 500–2 500 ₽')
    expect(formatDeliveryTime(30, 40)).toBe('30–40 минут')
    expect(formatDishPrice(890)).toBe('890 ₽')
  })

  it('возвращает русские подписи статусов заказа', () => {
    expect(getOrderStatusLabel('created')).toBe('Создан')
    expect(getOrderStatusLabel('delivering')).toBe('В доставке')
    expect(getOrderStatusLabel('unknown')).toBe('unknown')
  })

  it('преобразует ресторан к контракту фронтенда', () => {
    const dto = toRestaurantDto({
      id: 'restaurant-1',
      name: 'Трапеза',
      description: 'Тестовое описание',
      kitchenType: 'Русская',
      deliveryTimeFrom: 25,
      deliveryTimeTo: 35,
      averageCheckFrom: 1200,
      averageCheckTo: 1800,
      rating: 5,
      image: '/image.jpg',
      recent: true,
      favorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    expect(dto).toMatchObject({
      id: 'restaurant-1',
      time: '25–35 минут',
      price: '1 200–1 800 ₽',
      favorite: false,
    })
  })

  it('преобразует блюдо и позицию корзины', () => {
    const dish = {
      id: 'dish-1',
      restaurantId: 'restaurant-1',
      name: 'Гусь',
      description: 'С яблоками',
      image: '/goose.jpg',
      group: 'Основные блюда',
      price: 890,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    expect(toMenuDto(dish)).toMatchObject({
      id: 'dish-1',
      price: '890 ₽',
      group: 'Основные блюда',
    })

    expect(
      toCartDto({
        id: 'cart-1',
        userId: 'user-1',
        dishId: 'dish-1',
        quantity: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        dish,
      }),
    ).toMatchObject({
      id: 'cart-1',
      price: '1780',
      pricePerItem: 890,
      quantity: 2,
    })
  })

  it('преобразует заказ с позициями к данным страницы заказа', () => {
    const createdAt = new Date('2026-06-14T11:35:00.000Z')
    const dto = toOrderDto({
      id: 'order-1',
      userId: 'user-1',
      restaurantId: 'restaurant-1',
      status: 'delivered',
      address: 'ул. Тестовая, 1',
      courierName: 'Курьер',
      courierPhone: '+7',
      paymentMethod: 'Карта',
      paymentStatus: 'paid',
      totalPrice: 1780,
      createdAt,
      updatedAt: createdAt,
      restaurant: {
        id: 'restaurant-1',
        name: 'Трапеза',
        description: 'Тест',
        kitchenType: 'Русская',
        deliveryTimeFrom: 20,
        deliveryTimeTo: 30,
        averageCheckFrom: 1000,
        averageCheckTo: 1500,
        rating: 5,
        image: '/image.jpg',
        recent: false,
        favorite: false,
        createdAt,
        updatedAt: createdAt,
      },
      items: [
        {
          id: 'item-1',
          orderId: 'order-1',
          dishId: 'dish-1',
          quantity: 2,
          priceAtOrder: 890,
          price: 890,
          createdAt,
          updatedAt: createdAt,
          dish: {
            id: 'dish-1',
            restaurantId: 'restaurant-1',
            name: 'Гусь',
            description: 'С яблоками',
            image: '/goose.jpg',
            group: 'Основные блюда',
            price: 890,
            createdAt,
            updatedAt: createdAt,
          },
        },
      ],
      rating: null,
    })

    expect(dto).toMatchObject({
      id: 'order-1',
      statusLabel: 'Доставлен',
      restaurantName: 'Трапеза',
      totalPriceLabel: '1 780 ₽',
      items: [{ name: 'Гусь', priceLabel: '1 780 ₽' }],
    })
  })

  it('хеширует пароль и проверяет его безопасным сравнением', () => {
    const hash = hashPassword('password123')

    expect(hash).not.toBe('password123')
    expect(verifyPassword('password123', hash)).toBe(true)
    expect(verifyPassword('wrong-password', hash)).toBe(false)
  })
})
