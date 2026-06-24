import type { NextApiRequest, NextApiResponse } from 'next'

import { DEMO_USER_ID } from '@/db/constants'
import { getSessionUserId } from '@/utils/session'

const getStringParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

export const resolveRequestUserId = (req: NextApiRequest) => {
  const sessionUserId = getSessionUserId(req)

  if (sessionUserId) return sessionUserId

  if (process.env.ALLOW_DEMO_AUTH === 'true') {
    return getStringParam(req.query.userId) ?? DEMO_USER_ID
  }

  return null
}

export const requireRequestUserId = (req: NextApiRequest, res: NextApiResponse) => {
  const userId = resolveRequestUserId(req)

  if (!userId) {
    res.status(401).json({ message: 'Требуется авторизация' })
    return null
  }

  return userId
}
