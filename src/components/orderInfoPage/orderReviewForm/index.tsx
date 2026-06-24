import { FormEvent, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { sendOrderRating } from '@/api/orders/send-order-rating'
import PrimaryButton from '@/components/ui/buttons/primaryButton'
import StarRating from '@/components/ui/rating/starRating'
import { Order } from '@/types/order'

export default function OrderReviewForm({ order }: { order: Order }) {
  const [restaurantRating, setRestaurantRating] = useState(order.rating?.restaurantRating ?? 0)
  const [deliveryRating, setDeliveryRating] = useState(order.rating?.deliveryRating ?? 0)
  const [comment, setComment] = useState(order.rating?.comment ?? '')
  const [message, setMessage] = useState('')
  const queryClient = useQueryClient()

  const ratingMutation = useMutation({
    mutationFn: () =>
      sendOrderRating({
        orderId: order.id,
        restaurantRating,
        deliveryRating,
        comment,
      }),
    onSuccess: () => {
      setMessage('Отзыв сохранён')
      queryClient.invalidateQueries({ queryKey: ['order', order.id] })
    },
    onError: () => {
      setMessage('Не удалось сохранить отзыв')
    },
  })

  if (order.rating) {
    return (
      <div className='flex h-full flex-col gap-3 rounded-xl border border-gray-300 bg-white p-6 shadow-md shadow-gray-300'>
        <h3 className='font-roboto text-base font-bold text-gray-800 lg:text-xl'>
          Оценка сохранена
        </h3>
        <span className='text-sm text-gray-600'>
          Ресторан: {order.rating.restaurantRating}/5 · Доставка: {order.rating.deliveryRating}/5
        </span>
        {order.rating.comment && <p className='text-sm text-gray-600'>{order.rating.comment}</p>}
      </div>
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!restaurantRating || !deliveryRating) {
      setMessage('Поставьте оценки ресторану и доставке')
      return
    }

    ratingMutation.mutate()
  }

  return (
    <div className='flex h-full flex-col gap-2 rounded-xl border border-gray-300 bg-white p-6 shadow-md shadow-gray-300'>
      <div className='flex flex-col gap-4'>
        <h3 className='font-roboto text-base font-bold text-gray-800 lg:text-xl'>Оценить заказ</h3>

        <div className='flex flex-col gap-3 xl:flex-row xl:justify-between'>
          <StarRating label='Ресторан' value={restaurantRating} onChange={setRestaurantRating} />
          <StarRating label='Доставка' value={deliveryRating} onChange={setDeliveryRating} />
        </div>

        <form className='flex flex-col gap-2.5' onSubmit={handleSubmit}>
          <span className='text-sm text-gray-500'>Ваш отзыв</span>
          <textarea
            id='review'
            placeholder='Что Вам понравилось?'
            minLength={1}
            maxLength={1000}
            value={comment}
            onChange={event => setComment(event.target.value)}
            className='text-top h-[7.5rem] rounded border border-gray-300 px-3 py-2 text-gray-800 placeholder:text-sm placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none lg:placeholder:text-base'
          />
          <PrimaryButton type='submit'>Оставить отзыв</PrimaryButton>
          {message && <span className='text-sm text-gray-500'>{message}</span>}
        </form>
      </div>
    </div>
  )
}
