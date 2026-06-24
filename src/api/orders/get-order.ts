import { Order } from '@/types/order'

export const getOrder = async (id: string): Promise<Order> => {
  const res = await fetch(`/api/orders/${id}`)

  if (!res.ok) throw new Error('Ошибка загрузки заказа')

  return await res.json()
}
