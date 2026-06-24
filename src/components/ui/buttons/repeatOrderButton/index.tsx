import { useState } from 'react'
import { useRouter } from 'next/router'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { addToCart } from '@/api/add-to-cart'
import { Order } from '@/types/order'

export default function RepeatOrderButton({ order }: { order: Order }) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [message, setMessage] = useState('')

  const repeatOrderMutation = useMutation({
    mutationFn: () =>
      Promise.all(
        order.items.map(item =>
          addToCart({
            dishId: item.dishId,
            quantity: item.quantity,
          }),
        ),
      ),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['getCart'] })
      await router.push('/cart')
    },
    onError: () => setMessage('Не удалось повторить заказ'),
  })

  return (
    <>
      <button
        type='button'
        className='rounded-md border-2 border-gray-300 bg-transparent px-4 py-2 text-base font-bold text-gray-800 hover:border-gray-600 active:border-gray-800 lg:w-[11rem]'
        disabled={repeatOrderMutation.isPending}
        onClick={() => repeatOrderMutation.mutate()}
      >
        Повторить заказ
      </button>
      {message && <span className='text-sm text-red-600'>{message}</span>}
    </>
  )
}
