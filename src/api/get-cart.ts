import { CartResponse } from '@/types/menu'

export const getCart = async (id?: string): Promise<CartResponse> => {
  const params = id ? new URLSearchParams({ userId: id }) : null
  const res = await fetch(`/api/cart${params ? `?${params.toString()}` : ''}`)
  if (!res.ok) throw new Error('Ошибка загрузки корзины')
  return await res.json()
}
