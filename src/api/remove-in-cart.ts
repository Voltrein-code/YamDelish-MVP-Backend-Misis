import { CartResponse } from '@/types/menu'

export const removeInCart = async ({
  userId,
  cartItemId,
}: {
  userId?: string
  cartItemId: string
}): Promise<CartResponse> => {
  const params = new URLSearchParams({ cartItemId })

  if (userId) {
    params.set('userId', userId)
  }

  const res = await fetch(`/api/cart?${params.toString()}`, {
    method: 'DELETE',
  })

  if (!res.ok) throw new Error('Ошибка удаления блюда из корзины')
  return await res.json()
}
