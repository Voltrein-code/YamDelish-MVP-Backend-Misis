import type { NextApiRequest, NextApiResponse } from 'next'

import { saveOrderRating } from '@/services/delivery'
import { requireRequestUserId } from '@/utils/apiAuth'
import { getValidationMessage, orderRatingRequestSchema } from '@/utils/apiSchemas'
import { sendHttpError } from '@/utils/httpError'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Метод не поддерживается' })
  }

  try {
    const userId = requireRequestUserId(req, res)

    if (!userId) return

    const parsedBody = orderRatingRequestSchema.safeParse(req.body)

    if (!parsedBody.success) {
      return res.status(400).json({ message: getValidationMessage(parsedBody.error) })
    }

    const { orderId, restaurantRating, deliveryRating, comment } = parsedBody.data
    const rating = await saveOrderRating({
      userId,
      orderId,
      restaurantRating,
      deliveryRating,
      comment,
    })

    return res.status(201).json(rating)
  } catch (error) {
    return sendHttpError(res, error, 'Не удалось сохранить оценку')
  }
}
