import { z } from 'zod'

import checkfile from '@/utils/checkFile'

export const dishInfoSchema = z.object({
  name: z.string().min(2).max(30),
  image: z.instanceof(File).refine(checkfile, {
    message:
      'Картинка не верного формата: допустимые форматы JPG, PNG, GIF, допустимый размер файла не более 5мб',
  }),
  about: z.string().max(100),
  price: z.number().positive({
    message: 'Цена не может быть ниже нуля',
  }),
})

export type DishInfo = z.infer<typeof dishInfoSchema>
