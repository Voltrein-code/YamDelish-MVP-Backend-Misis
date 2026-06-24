import { z } from 'zod'

import { dishInfoSchema } from './dish'
import { ratingSchema } from './rating'

export const orderItemSchema = z.object({
  dish: dishInfoSchema,
  count: z.number().positive().int(),
})

export type OrderItem = z.infer<typeof orderItemSchema>

export const courierInfoSchema = z.array(z.string()).length(2)
export type CourierInfo = z.infer<typeof courierInfoSchema>

export const paymentInfoSchema = z.array(z.string()).length(2)
export type PaymentInfo = z.infer<typeof courierInfoSchema>

export const orderInfoSchema = z.object({
  createdAt: z.date({ coerce: true }),
  restaurantName: z.string(),
  dishList: z.array(orderItemSchema),
  courierInfo: courierInfoSchema,
  adress: z.string(),
  payment: paymentInfoSchema,
})

export type OrderInfo = z.infer<typeof orderInfoSchema>

export const orderRateSchema = z.object({
  restaurantRate: ratingSchema,
  deliveryRate: ratingSchema,
  comment: z.string().max(1000),
})

export type OrderRate = z.infer<typeof orderRateSchema>
