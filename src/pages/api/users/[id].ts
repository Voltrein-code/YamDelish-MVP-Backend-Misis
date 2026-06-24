import type { NextApiRequest, NextApiResponse } from 'next'

import { getUserProfile, updateUserProfile } from '@/services/delivery'
import { requireRequestUserId } from '@/utils/apiAuth'
import { getValidationMessage, userUpdateRequestSchema } from '@/utils/apiSchemas'
import { sendHttpError } from '@/utils/httpError'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sessionUserId = requireRequestUserId(req, res)

  if (!sessionUserId) return

  const requestedId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id

  if (!requestedId) {
    return res.status(400).json({ message: 'id пользователя обязателен' })
  }

  try {
    if (req.method === 'GET') {
      const user = await getUserProfile(requestedId, sessionUserId)

      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' })
      }

      return res.status(200).json(user)
    }

    if (req.method === 'PATCH') {
      const parsedBody = userUpdateRequestSchema.safeParse(req.body)

      if (!parsedBody.success) {
        return res.status(400).json({ message: getValidationMessage(parsedBody.error) })
      }

      const user = await updateUserProfile({
        userId: requestedId,
        sessionUserId,
        ...parsedBody.data,
      })

      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' })
      }

      return res.status(200).json(user)
    }

    res.setHeader('Allow', 'GET, PATCH')
    return res.status(405).json({ message: 'Метод не поддерживается' })
  } catch (error) {
    return sendHttpError(res, error, 'Не удалось обработать профиль')
  }
}
