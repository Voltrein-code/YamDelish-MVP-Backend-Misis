import type { NextApiRequest, NextApiResponse } from 'next'

import { restorePassword } from '@/services/auth'
import { getValidationMessage, passwordRestoreRequestSchema } from '@/utils/apiSchemas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Метод не поддерживается' })
  }

  try {
    const parsedBody = passwordRestoreRequestSchema.safeParse(req.body)

    if (!parsedBody.success) {
      return res.status(400).json({ message: getValidationMessage(parsedBody.error) })
    }

    const { email } = parsedBody.data

    await restorePassword(email)

    return res.status(200).json({
      message: 'Если пользователь существует, инструкция будет отправлена на email',
    })
  } catch {
    return res.status(500).json({ message: 'Не удалось обработать восстановление пароля' })
  }
}
