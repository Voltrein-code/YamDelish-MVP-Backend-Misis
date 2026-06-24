import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

const keyLength = 64

export const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, keyLength).toString('hex')

  return `${salt}:${hash}`
}

export const verifyPassword = (password: string, storedPassword: string) => {
  const [salt, storedHash] = storedPassword.split(':')

  if (!salt || !storedHash) {
    return false
  }

  const hash = scryptSync(password, salt, keyLength)
  const storedHashBuffer = Buffer.from(storedHash, 'hex')

  if (hash.length !== storedHashBuffer.length) {
    return false
  }

  return timingSafeEqual(hash, storedHashBuffer)
}
