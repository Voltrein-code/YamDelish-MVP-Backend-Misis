import { z } from 'zod'

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const registerRequestSchema = z.object({
  name: z.string().min(2).max(30),
  surname: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().max(30).optional(),
  address: z.string().max(250).optional(),
})

export const cartAddRequestSchema = z.object({
  dishId: z.string().min(1),
  quantity: z.coerce.number().int().positive().default(1),
})

export const cartUpdateRequestSchema = z.object({
  cartItemId: z.string().min(1),
  quantity: z.coerce.number().int().min(0),
})

export const orderCreateRequestSchema = z.object({
  address: z.string(),
  paymentMethod: z.string().min(1).default('card'),
})

export const orderRatingRequestSchema = z.object({
  orderId: z.string().min(1),
  restaurantRating: z.coerce.number().int().min(1).max(5),
  deliveryRating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

export const passwordRestoreRequestSchema = z.object({
  email: z.string().email(),
})

export const userUpdateRequestSchema = z
  .object({
    name: z.string().min(2).max(30).optional(),
    surname: z.string().min(2).max(50).optional(),
    phone: z.string().max(30).nullable().optional(),
    address: z.string().max(250).nullable().optional(),
  })
  .strict()

export const getValidationMessage = (error: z.ZodError) =>
  error.issues[0]?.message ?? 'Некорректные данные запроса'
