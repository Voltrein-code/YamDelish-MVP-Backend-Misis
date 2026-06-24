import { CartResponse } from '@/types/menu'

export const addToCart = async ({
  userId,
  dishId,
  quantity = 1,
}: {
  userId?: string
  dishId: string
  quantity?: number
}): Promise<CartResponse> => {
  const params = userId ? new URLSearchParams({ userId }) : null
  const res = await fetch(`/api/cart${params ? `?${params.toString()}` : ''}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ dishId, quantity }),
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null
    const error = new Error(body?.message ?? 'Ошибка добавления блюда в корзину') as Error & {
      status: number
    }
    error.status = res.status
    throw error
  }
  return await res.json()
}
