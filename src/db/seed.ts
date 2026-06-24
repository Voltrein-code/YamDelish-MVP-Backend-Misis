import { eq } from 'drizzle-orm'

import { hashPassword } from '../utils/password'
import { DEMO_USER_ID } from './constants'
import { client, db } from './index'
import { cartItems, dishes, orderItems, orderRatings, orders, restaurants, users } from './schema'

const restaurantSeeds = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    name: 'Трапеза Ярополка',
    rating: 5,
    description: 'Традиционная кухня',
    kitchenType: 'Славянская',
    deliveryTimeFrom: 30,
    deliveryTimeTo: 40,
    averageCheckFrom: 1500,
    averageCheckTo: 2000,
    image: '/images/yaropolk.jpg',
    recent: true,
    favorite: false,
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    name: 'Мёд и перец',
    rating: 1,
    description: 'Современные блюда с акцентом на местные продукты',
    kitchenType: 'Микс кулинарных традиций',
    deliveryTimeFrom: 40,
    deliveryTimeTo: 50,
    averageCheckFrom: 2000,
    averageCheckTo: 2500,
    image: '/images/honey.jpg',
    recent: true,
    favorite: true,
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    name: 'Славянский пир',
    rating: 2,
    description: 'Аутентичные рецепты, блюда для гурманов',
    kitchenType: 'Русская',
    deliveryTimeFrom: 25,
    deliveryTimeTo: 35,
    averageCheckFrom: 1200,
    averageCheckTo: 1500,
    image: '/images/slavicFeast.png',
    recent: true,
    favorite: true,
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    name: 'Берестяной двор',
    rating: 4,
    description: 'Блюда в старинном стиле, традиционные супы и пироги',
    kitchenType: 'Традиционная русская',
    deliveryTimeFrom: 20,
    deliveryTimeTo: 30,
    averageCheckFrom: 1000,
    averageCheckTo: 1400,
    image: '/images/birchbarkYard.jpg',
    recent: true,
    favorite: false,
  },
  {
    id: '10000000-0000-4000-8000-000000000005',
    name: 'Коптильня',
    rating: 4,
    description: 'Мясо на дровах и ароматные копчёности',
    kitchenType: 'Барбекю',
    deliveryTimeFrom: 30,
    deliveryTimeTo: 40,
    averageCheckFrom: 1500,
    averageCheckTo: 2000,
    image: '/images/koptilnya.png',
    recent: false,
    favorite: true,
  },
  {
    id: '10000000-0000-4000-8000-000000000006',
    name: 'Чайный дом',
    rating: 4,
    description: 'Секреты китайской и японской кухни, традиционные чаи',
    kitchenType: 'Азиатская',
    deliveryTimeFrom: 35,
    deliveryTimeTo: 45,
    averageCheckFrom: 1200,
    averageCheckTo: 1800,
    image: '/images/teaHouse.png',
    recent: false,
    favorite: true,
  },
  {
    id: '10000000-0000-4000-8000-000000000007',
    name: 'Булочная у Радмилы',
    rating: 5,
    description: 'Свежая выпечка, пироги и домашние десерты',
    kitchenType: 'Кондитерская',
    deliveryTimeFrom: 15,
    deliveryTimeTo: 25,
    averageCheckFrom: 500,
    averageCheckTo: 1000,
    image: '/images/radmila.jpg',
    recent: true,
    favorite: true,
  },
  {
    id: '10000000-0000-4000-8000-000000000008',
    name: 'Рыбацкая артель',
    rating: 3,
    description: 'Морепродукты и свежая рыба с авторской подачей',
    kitchenType: 'Рыбная',
    deliveryTimeFrom: 40,
    deliveryTimeTo: 50,
    averageCheckFrom: 2000,
    averageCheckTo: 2400,
    image: '/images/fishArtel.png',
    recent: false,
    favorite: true,
  },
]

const dishSeeds = [
  {
    id: '20000000-0000-4000-8000-000000000001',
    restaurantId: '10000000-0000-4000-8000-000000000001',
    name: 'Жареный гусь с яблоками',
    price: 890,
    description: 'Сочный гусь, запеченный с кисло-сладкими яблоками и ароматными травами.',
    image: '/images/yaropolk.jpg',
    group: 'Супы',
  },
  {
    id: '20000000-0000-4000-8000-000000000002',
    restaurantId: '10000000-0000-4000-8000-000000000002',
    name: 'Медовик по-старославянски',
    price: 300,
    description: 'Многослойный медовый торт с нежным кремом.',
    image: '/images/honey.jpg',
    group: 'Супы',
  },
  {
    id: '20000000-0000-4000-8000-000000000003',
    restaurantId: '10000000-0000-4000-8000-000000000003',
    name: 'Жаркое из телятины',
    price: 550,
    description:
      'Жаркое из телятины, приготовленное в горшочке с картофелем, морковью и луком в сливочном соусе.',
    image: '/images/slavicFeast.png',
    group: 'Супы',
  },
  {
    id: '20000000-0000-4000-8000-000000000004',
    restaurantId: '10000000-0000-4000-8000-000000000004',
    name: 'Уха по-царски',
    price: 320,
    description:
      'Богатый рыбный суп на основе сёмги и судака с добавлением ароматных специй и корней.',
    image: '/images/birchbarkYard.jpg',
    group: 'Супы',
  },
  {
    id: '20000000-0000-4000-8000-000000000005',
    restaurantId: '10000000-0000-4000-8000-000000000006',
    name: "Чай травяной 'Сила земли'",
    price: 120,
    description: 'Сбор целебных трав, дарующих бодрость и здоровье.',
    image: '/images/teaHouse.png',
    group: 'Основные блюда',
  },
  {
    id: '20000000-0000-4000-8000-000000000006',
    restaurantId: '10000000-0000-4000-8000-000000000007',
    name: "Булочка 'Улитка' с маком",
    price: 245,
    description: 'Немецкая булочка с маком и малиновой помадкой.',
    image: '/images/radmila.jpg',
    group: 'Десерты',
  },
]

const orderSeeds = [
  // Заказы покрывают разные статусы, чтобы страницы истории и деталей не были пустыми.
  {
    id: '30000000-0000-4000-8000-000000000001',
    userId: DEMO_USER_ID,
    restaurantId: '10000000-0000-4000-8000-000000000001',
    status: 'delivered' as const,
    address: 'г. Москва, ул. Примерная, д. 5',
    courierName: 'Доброгост Сварожич',
    courierPhone: '+7 900 123-45-67',
    paymentMethod: 'Онлайн, карта *4425',
    paymentStatus: 'paid',
    totalPrice: 1780,
    createdAt: new Date('2026-06-14T11:35:00.000Z'),
    updatedAt: new Date('2026-06-14T12:20:00.000Z'),
  },
  {
    id: '30000000-0000-4000-8000-000000000002',
    userId: DEMO_USER_ID,
    restaurantId: '10000000-0000-4000-8000-000000000002',
    status: 'delivering' as const,
    address: 'г. Москва, Никольская ул., д. 10',
    courierName: 'Мирослав',
    courierPhone: '+7 900 555-12-10',
    paymentMethod: 'Оплата при получении',
    paymentStatus: 'pending',
    totalPrice: 600,
    createdAt: new Date('2026-06-15T09:20:00.000Z'),
    updatedAt: new Date('2026-06-15T09:45:00.000Z'),
  },
  {
    id: '30000000-0000-4000-8000-000000000003',
    userId: DEMO_USER_ID,
    restaurantId: '10000000-0000-4000-8000-000000000007',
    status: 'cooking' as const,
    address: 'г. Москва, Тверская ул., д. 7',
    courierName: null,
    courierPhone: null,
    paymentMethod: 'Онлайн, СБП',
    paymentStatus: 'paid',
    totalPrice: 490,
    createdAt: new Date('2026-06-15T10:05:00.000Z'),
    updatedAt: new Date('2026-06-15T10:05:00.000Z'),
  },
]

const orderItemSeeds = [
  {
    id: '40000000-0000-4000-8000-000000000001',
    orderId: '30000000-0000-4000-8000-000000000001',
    dishId: '20000000-0000-4000-8000-000000000001',
    quantity: 2,
    priceAtOrder: 890,
  },
  {
    id: '40000000-0000-4000-8000-000000000002',
    orderId: '30000000-0000-4000-8000-000000000002',
    dishId: '20000000-0000-4000-8000-000000000002',
    quantity: 2,
    priceAtOrder: 300,
  },
  {
    id: '40000000-0000-4000-8000-000000000003',
    orderId: '30000000-0000-4000-8000-000000000003',
    dishId: '20000000-0000-4000-8000-000000000006',
    quantity: 2,
    priceAtOrder: 245,
  },
]

const orderRatingSeeds = [
  {
    id: '50000000-0000-4000-8000-000000000001',
    orderId: '30000000-0000-4000-8000-000000000001',
    restaurantRating: 5,
    deliveryRating: 4,
    feedback: 'Гусь был горячим, доставка приехала быстро.',
    createdAt: new Date('2026-06-14T12:40:00.000Z'),
  },
]

async function seed() {
  await db
    .insert(users)
    .values({
      id: DEMO_USER_ID,
      name: 'Гость',
      surname: 'YamDelish',
      email: 'guest@yamdelish.local',
      passwordHash: hashPassword('password123'),
      phone: '+7 900 000-00-00',
      address: 'г. Москва, ул. Примерная, д. 5',
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        name: 'Гость',
        surname: 'YamDelish',
        email: 'guest@yamdelish.local',
        passwordHash: hashPassword('password123'),
        phone: '+7 900 000-00-00',
        address: 'г. Москва, ул. Примерная, д. 5',
      },
    })

  await db.insert(restaurants).values(restaurantSeeds).onConflictDoNothing()
  await db.insert(dishes).values(dishSeeds).onConflictDoNothing()
  await db.delete(cartItems).where(eq(cartItems.userId, DEMO_USER_ID))
  await db.insert(cartItems).values({
    userId: DEMO_USER_ID,
    dishId: '20000000-0000-4000-8000-000000000001',
    quantity: 1,
  })
  await db.insert(orders).values(orderSeeds).onConflictDoNothing()
  await db.insert(orderItems).values(orderItemSeeds).onConflictDoNothing()
  await db.insert(orderRatings).values(orderRatingSeeds).onConflictDoNothing()
}

seed()
  .then(() => {
    console.log('Database seeded')
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => client.close())
