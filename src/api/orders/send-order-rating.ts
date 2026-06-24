export const sendOrderRating = async (data: {
  orderId: string
  restaurantRating: number
  deliveryRating: number
  comment?: string
}) => {
  const res = await fetch('/api/orders/rating', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) throw new Error('Ошибка сохранения отзыва')

  return await res.json()
}
