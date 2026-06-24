import { Order } from '@/types/order'

export const getOrders = async (userId?: string): Promise<Order[]> => {
  const params = userId ? new URLSearchParams({ userId }) : null
  const res = await fetch(`/api/orders${params ? `?${params.toString()}` : ''}`)

  if (!res.ok) throw new Error('Ошибка загрузки заказов')

  return await res.json()
}
