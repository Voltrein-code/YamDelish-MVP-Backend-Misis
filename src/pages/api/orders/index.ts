import type { NextApiRequest, NextApiResponse } from 'next'

import { createOrderFromCart, getUserOrders } from '@/services/delivery'
import { requireRequestUserId } from '@/utils/apiAuth'
import { getValidationMessage, orderCreateRequestSchema } from '@/utils/apiSchemas'
import { sendHttpError } from '@/utils/httpError'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userId = requireRequestUserId(req, res)

    if (!userId) return

    if (req.method === 'GET') {
      const orders = await getUserOrders(userId)
      return res.status(200).json(orders)
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST')
      return res.status(405).json({ message: 'Метод не поддерживается' })
    }

    const parsedBody = orderCreateRequestSchema.safeParse(req.body)

    if (!parsedBody.success) {
      return res.status(400).json({ message: getValidationMessage(parsedBody.error) })
    }

    const { address, paymentMethod } = parsedBody.data

    const order = await createOrderFromCart({
      userId,
      address,
      paymentMethod,
    })

    return res.status(201).json(order)
  } catch (error) {
    return sendHttpError(res, error, 'Не удалось обработать заказы')
  }
}
