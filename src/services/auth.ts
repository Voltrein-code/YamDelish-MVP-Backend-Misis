import type { NextApiResponse } from 'next'
import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { users } from '@/db/schema'
import { hashPassword, verifyPassword } from '@/utils/password'
import { clearSessionCookie } from '@/utils/session'

export const registerUser = async ({
  name,
  surname,
  email,
  password,
  phone,
  address,
}: {
  name: string
  surname: string
  email: string
  password: string
  phone?: string
  address?: string
}) => {
  const normalizedEmail = email.toLowerCase()
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  })

  if (existingUser) return null

  const createdUser = await db
    .insert(users)
    .values({
      name,
      surname,
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      phone,
      address,
    })
    .returning({
      id: users.id,
      name: users.name,
      surname: users.surname,
      email: users.email,
      phone: users.phone,
      address: users.address,
    })

  return createdUser[0]
}

export const loginUser = async (email: string, password: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  })

  if (!user || !verifyPassword(password, user.passwordHash)) return null

  return {
    id: user.id,
    name: user.name,
    surname: user.surname,
    email: user.email,
  }
}

export const restorePassword = async (email: string) => {
  await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  })
}

export const logoutUser = (res: NextApiResponse) => clearSessionCookie(res)
