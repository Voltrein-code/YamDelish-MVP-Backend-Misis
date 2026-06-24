import { z } from 'zod'

export const ratingSchema = z.number().gte(0).lte(5).multipleOf(1).int()

export type Rating = z.infer<typeof ratingSchema>
