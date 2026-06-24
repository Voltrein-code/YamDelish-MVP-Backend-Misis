export const sendOrder = async (data: {
  userId?: string
  address: string
  paymentMethod?: string
}) => {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) throw new Error('Ошибка оформления заказа')
  return await res.json()
}
