import type { NextApiRequest, NextApiResponse } from 'next'

import { logoutUser } from '@/services/auth'
import { requireRequestUserId } from '@/utils/apiAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Метод не поддерживается' })
  }

  const userId = requireRequestUserId(req, res)

  if (!userId) return

  logoutUser(res)
  return res.status(200).json({ message: 'Выход выполнен' })
}
