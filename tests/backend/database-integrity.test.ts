import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createClient } from '@libsql/client'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const client = createClient({ url: 'file::memory:' })

const applyMigration = async (fileName: string) => {
  const migration = readFileSync(path.resolve(process.cwd(), 'migrations', fileName), 'utf8')
  const statements = migration
    .split('--> statement-breakpoint')
    .map(statement => statement.trim())
    .filter(Boolean)

  for (const statement of statements) await client.execute(statement)
}

describe('database integrity constraints', () => {
  beforeAll(async () => {
    await applyMigration('0000_brainy_human_robot.sql')
    await applyMigration('0001_enforce_data_integrity.sql')
    await applyMigration('0002_align_vkr_schema.sql')
    await applyMigration('0003_match_vkr_contract.sql')
    await applyMigration('0004_add_vkr_compatibility_aliases.sql')
    await applyMigration('0005_convert_legacy_seed_ids_to_uuid.sql')

    await client.batch(
      [
        "INSERT INTO users (id,name,surname,email,password_hash) VALUES ('user-1','Иван','Иванов','ivan@example.com','hash')",
        "INSERT INTO restaurants (id,name,description,kitchen_type,delivery_time_from,delivery_time_to,average_check_from,average_check_to,rating,image) VALUES ('restaurant-1','Первый','Описание','Кухня',10,20,100,200,5,'/1.jpg')",
        "INSERT INTO restaurants (id,name,description,kitchen_type,delivery_time_from,delivery_time_to,average_check_from,average_check_to,rating,image) VALUES ('restaurant-2','Второй','Описание','Кухня',10,20,100,200,5,'/2.jpg')",
        "INSERT INTO dishes (id,restaurant_id,name,description,image,group_name,price) VALUES ('dish-1','restaurant-1','Блюдо 1','Описание','/1.jpg','Основное',100)",
        "INSERT INTO dishes (id,restaurant_id,name,description,image,group_name,price) VALUES ('dish-2','restaurant-2','Блюдо 2','Описание','/2.jpg','Основное',200)",
        "INSERT INTO orders (id,user_id,restaurant_id,address,payment_method,total_price) VALUES ('order-1','user-1','restaurant-1','Москва','card',100)",
      ],
      'write',
    )
  })

  afterAll(() => client.close())

  it('не допускает блюда разных ресторанов в одной корзине', async () => {
    await client.execute(
      "INSERT INTO cart_items (id,user_id,dish_id,quantity) VALUES ('cart-1','user-1','dish-1',1)",
    )

    await expect(
      client.execute(
        "INSERT INTO cart_items (id,user_id,dish_id,quantity) VALUES ('cart-2','user-1','dish-2',1)",
      ),
    ).rejects.toThrow('one restaurant')
  })

  it('не допускает неположительное количество', async () => {
    await expect(
      client.execute(
        "INSERT INTO cart_items (id,user_id,dish_id,quantity) VALUES ('cart-invalid','user-1','dish-1',0)",
      ),
    ).rejects.toThrow('positive')
  })

  it('не допускает блюдо чужого ресторана в позиции заказа', async () => {
    await expect(
      client.execute(
        "INSERT INTO order_items (id,order_id,dish_id,quantity,price_at_order) VALUES ('item-invalid','order-1','dish-2',1,200)",
      ),
    ).rejects.toThrow('restaurant must match')
  })

  it('ограничивает оценки диапазоном от 1 до 5', async () => {
    await expect(
      client.execute(
        "INSERT INTO order_ratings (id,order_id,restaurant_rating,delivery_rating) VALUES ('rating-invalid','order-1',0,5)",
      ),
    ).rejects.toThrow('CHECK constraint failed')
  })

  it('ограничивает статус заказа допустимым набором', async () => {
    await expect(
      client.execute("UPDATE orders SET status = 'unknown' WHERE id = 'order-1'"),
    ).rejects.toThrow('invalid order status')
  })

  it('хранит текст оценки в поле feedback', async () => {
    await client.execute(
      "INSERT INTO order_ratings (id,order_id,restaurant_rating,delivery_rating,feedback) VALUES ('rating-1','order-1',5,4,'Отлично')",
    )
    const result = await client.execute(
      "SELECT feedback, comment FROM order_ratings WHERE id = 'rating-1'",
    )

    expect(result.rows[0].feedback).toBe('Отлично')
    expect(result.rows[0].comment).toBe('Отлично')
  })

  it('предоставляет price как алиас price_at_order', async () => {
    await client.execute(
      "INSERT INTO order_items (id,order_id,dish_id,quantity,price_at_order) VALUES ('item-1','order-1','dish-1',1,100)",
    )
    const result = await client.execute(
      "SELECT price_at_order, price FROM order_items WHERE id = 'item-1'",
    )

    expect(result.rows[0].price_at_order).toBe(100)
    expect(result.rows[0].price).toBe(100)
  })
})
