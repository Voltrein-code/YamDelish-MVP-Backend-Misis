import { OrderItem } from '@/types/order'

export const DishCard = ({ item }: { item: OrderItem }) => {
  return (
    <div className='flex w-full items-center justify-between'>
      <span className='text-xs text-gray-800 lg:text-base'>{item.name}</span>
      <span className='text-xs text-gray-800 lg:text-base'>{item.quantity} шт.</span>
      <span className='text-sm font-bold text-gray-800 lg:text-base'>{item.priceLabel}</span>
    </div>
  )
}
