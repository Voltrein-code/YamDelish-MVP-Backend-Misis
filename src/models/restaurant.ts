import { z } from 'zod'

import checkfile from '@/utils/checkFile'

import { ratingSchema } from './rating'

export const restaurantInfoSchema = z.object({
  name: z.string().min(2).max(30),
  image: z.instanceof(File).refine(checkfile, {
    message:
      'Картинка не верного формата: допустимые форматы JPG, PNG, GIF, допустимый размер файла не более 5мб',
  }),
  about: z.string().max(55),
  rating: ratingSchema,
  kitchenType: z.string(),
  timeToDelivery: z.array(z.number()).length(2),
  averageСheck: z.array(z.number()).length(2),
})

export type RestaurantInfo = z.infer<typeof restaurantInfoSchema>
