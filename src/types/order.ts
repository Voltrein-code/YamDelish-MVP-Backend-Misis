export interface OrderItem {
  id: string
  dishId: string
  name: string
  quantity: number
  price: number
  priceAtOrder: number
  priceLabel: string
}

export interface Order {
  id: string
  date: string
  time: string
  status: string
  statusLabel: string
  restaurantId: string
  restaurantName: string
  address: string
  courierName: string | null
  courierPhone: string | null
  paymentMethod: string
  paymentStatus: string
  totalPrice: number
  totalPriceLabel: string
  items: OrderItem[]
  rating?: {
    restaurantRating: number
    deliveryRating: number
    comment: string | null
  } | null
}
