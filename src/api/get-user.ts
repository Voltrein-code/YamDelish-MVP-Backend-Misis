import { User } from '@/types/user'

export const getUser = async (id: string): Promise<User> => {
  const res = await fetch(`/api/users/${id}`)

  if (!res.ok) throw new Error('Ошибка загрузки профиля')

  return await res.json()
}
