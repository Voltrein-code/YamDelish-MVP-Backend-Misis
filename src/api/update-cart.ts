import { CartResponse } from '@/types/menu'

export const updateCart = async ({
  userId,
  cartItemId,
  quantity,
}: {
  userId?: string
  cartItemId: string
  quantity: number
}): Promise<CartResponse> => {
  const params = userId ? new URLSearchParams({ userId }) : null
  const res = await fetch(`/api/cart${params ? `?${params.toString()}` : ''}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cartItemId, quantity }),
  })

  if (!res.ok) throw new Error('Ошибка обновления корзины')

  return await res.json()
}
