import { User } from '@/types/user'

export const updateUser = async ({
  id,
  ...data
}: Partial<Pick<User, 'name' | 'surname' | 'phone' | 'address'>> & {
  id: string
}): Promise<User> => {
  const res = await fetch(`/api/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) throw new Error('Ошибка сохранения профиля')

  return await res.json()
}
