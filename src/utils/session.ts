import { createHmac, timingSafeEqual } from 'crypto'
import type { NextApiRequest, NextApiResponse } from 'next'

const cookieName = 'yamdelish_session'
const maxAge = 60 * 60 * 24 * 7

const getSecret = () => {
  const secret = process.env.AUTH_SECRET

  if (secret) return secret

  if (process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET обязателен в production')
  }

  return 'local-development-secret'
}

const base64UrlEncode = (value: string) => Buffer.from(value).toString('base64url')

const base64UrlDecode = (value: string) => Buffer.from(value, 'base64url').toString('utf8')

const sign = (payload: string) =>
  createHmac('sha256', getSecret()).update(payload).digest('base64url')

const parseCookies = (cookieHeader?: string) => {
  if (!cookieHeader) return {}

  return cookieHeader.split(';').reduce<Record<string, string>>((acc, cookie) => {
    const [name, ...valueParts] = cookie.trim().split('=')
    acc[name] = valueParts.join('=')
    return acc
  }, {})
}

export const createSessionToken = (userId: string) => {
  const payload = base64UrlEncode(
    JSON.stringify({
      userId,
      exp: Math.floor(Date.now() / 1000) + maxAge,
    }),
  )

  return `${payload}.${sign(payload)}`
}

export const verifySessionToken = (token?: string) => {
  if (!token) return null

  const [payload, signature] = token.split('.')

  if (!payload || !signature) return null

  const expectedSignature = sign(payload)
  const signatureBuffer = Buffer.from(signature)
  const expectedSignatureBuffer = Buffer.from(expectedSignature)

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return null
  }

  try {
    const session = JSON.parse(base64UrlDecode(payload)) as { userId?: string; exp?: number }

    if (!session.userId || !session.exp || session.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return session.userId
  } catch {
    return null
  }
}

export const getSessionUserId = (req: NextApiRequest) => {
  const cookies = parseCookies(req.headers?.cookie)
  return verifySessionToken(cookies[cookieName])
}

export const setSessionCookie = (res: NextApiResponse, userId: string) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''

  res.setHeader(
    'Set-Cookie',
    `${cookieName}=${createSessionToken(userId)}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`,
  )
}

export const clearSessionCookie = (res: NextApiResponse) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''

  res.setHeader('Set-Cookie', `${cookieName}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure}`)
}
