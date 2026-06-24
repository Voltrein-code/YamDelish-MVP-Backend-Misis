import type { NextApiRequest, NextApiResponse } from 'next'

import { registerUser } from '@/services/auth'
import { getValidationMessage, registerRequestSchema } from '@/utils/apiSchemas'
import { setSessionCookie } from '@/utils/session'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Метод не поддерживается' })
  }

  try {
    const parsedBody = registerRequestSchema.safeParse(req.body)

    if (!parsedBody.success) {
      return res.status(400).json({ message: getValidationMessage(parsedBody.error) })
    }

    const createdUser = await registerUser(parsedBody.data)

    if (!createdUser) {
      return res.status(409).json({ message: 'Пользователь с таким email уже существует' })
    }

    setSessionCookie(res, createdUser.id)

    return res.status(201).json(createdUser)
  } catch {
    return res.status(500).json({ message: 'Не удалось зарегистрировать пользователя' })
  }
}
