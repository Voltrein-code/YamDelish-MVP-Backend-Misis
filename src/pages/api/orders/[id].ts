import type { NextApiRequest, NextApiResponse } from 'next'

import { getOrderDetails } from '@/services/delivery'
import { requireRequestUserId } from '@/utils/apiAuth'
import { sendHttpError } from '@/utils/httpError'

const getStringParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ message: 'Метод не поддерживается' })
  }

  try {
    const userId = requireRequestUserId(req, res)

    if (!userId) return

    const id = getStringParam(req.query.id)

    if (!id) {
      return res.status(400).json({ message: 'id заказа обязателен' })
    }

    const order = await getOrderDetails(id, userId)

    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' })
    }

    return res.status(200).json(order)
  } catch (error) {
    return sendHttpError(res, error, 'Не удалось загрузить заказ')
  }
}
