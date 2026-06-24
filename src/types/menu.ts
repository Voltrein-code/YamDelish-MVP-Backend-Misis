export interface Menu {
  id?: string
  restaurantId?: string
  dishId?: string
  name: string
  price: string
  pricePerItem?: number
  quantity?: number
  description: string
  image: string
  group: string
}

export type MenuGroup = Record<string, Menu[]>

export interface CartResponse {
  items: Menu[]
  totalItems: number
  totalPrice: number
}
