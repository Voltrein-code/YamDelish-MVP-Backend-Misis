import type { NextApiRequest, NextApiResponse } from 'next'

import { getRestaurantMenu } from '@/services/delivery'

const getStringParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ message: 'Метод не поддерживается' })
  }

  try {
    const restaurantId = getStringParam(req.query.restaurantId)

    if (!restaurantId) {
      return res.status(400).json({ message: 'restaurantId обязателен' })
    }

    const menu = await getRestaurantMenu(restaurantId)

    return res.status(200).json(menu)
  } catch {
    return res.status(500).json({ message: 'Не удалось загрузить меню' })
  }
}
