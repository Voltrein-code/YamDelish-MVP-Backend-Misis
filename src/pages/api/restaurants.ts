import type { NextApiRequest, NextApiResponse } from 'next'

import { getRestaurants } from '@/services/delivery'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ message: 'Метод не поддерживается' })
  }

  try {
    const restaurants = await getRestaurants()
    return res.status(200).json(restaurants)
  } catch {
    return res.status(500).json({ message: 'Не удалось загрузить рестораны' })
  }
}
