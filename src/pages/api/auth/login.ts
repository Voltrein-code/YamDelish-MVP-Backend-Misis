import type { NextApiRequest, NextApiResponse } from 'next'

import { loginUser } from '@/services/auth'
import { getValidationMessage, loginRequestSchema } from '@/utils/apiSchemas'
import { setSessionCookie } from '@/utils/session'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Метод не поддерживается' })
  }

  try {
    const parsedBody = loginRequestSchema.safeParse(req.body)

    if (!parsedBody.success) {
      return res.status(400).json({ message: getValidationMessage(parsedBody.error) })
    }

    const { email, password } = parsedBody.data

    const user = await loginUser(email, password)

    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' })
    }

    setSessionCookie(res, user.id)

    return res.status(200).json(user)
  } catch {
    return res.status(500).json({ message: 'Не удалось выполнить вход' })
  }
}
