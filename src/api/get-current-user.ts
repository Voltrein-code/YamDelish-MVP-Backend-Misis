import { User } from '@/types/user'

export const getCurrentUser = async (): Promise<User> => {
  const res = await fetch('/api/auth/me')

  if (!res.ok) throw new Error('Ошибка загрузки текущего пользователя')

  return await res.json()
}
