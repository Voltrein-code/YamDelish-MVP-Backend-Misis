import type { NextApiRequest, NextApiResponse } from 'next'

import { getCurrentUser } from '@/services/delivery'
import { requireRequestUserId } from '@/utils/apiAuth'
import { sendHttpError } from '@/utils/httpError'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ message: 'Метод не поддерживается' })
  }

  try {
    const userId = requireRequestUserId(req, res)

    if (!userId) return

    const user = await getCurrentUser(userId)

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    return res.status(200).json(user)
  } catch (error) {
    return sendHttpError(res, error, 'Не удалось получить текущего пользователя')
  }
}
