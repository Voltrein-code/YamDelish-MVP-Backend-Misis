import { useRouter } from 'next/router'

import { Order } from '@/types/order'

export const OrderCard = ({ order }: { order: Order }) => {
  const router = useRouter()

  const goToOrder = () => {
    router.push({
      pathname: '/order-info',
      query: { id: order.id },
    })
  }

  return (
    <>
      <div className='grid grid-cols-[auto_auto_auto] grid-rows-[auto_auto_auto] gap-y-2 rounded-md bg-white px-6 py-2 shadow-md lg:hidden'>
        <span className='col-start-1 row-start-1 text-sm text-gray-800'>{order.date}</span>
        <span className='col-start-2 row-start-1 justify-self-start text-sm text-gray-600'>
          {order.time}
        </span>
        <span className='col-start-3 row-start-1 justify-self-end text-sm text-green-500'>
          {order.statusLabel}
        </span>
        <span className='col-span-2 col-start-1 row-start-2 truncate text-sm text-gray-800'>
          «{order.restaurantName}»
        </span>
        <span className='col-start-3 row-start-2 justify-self-end text-sm font-bold text-gray-800'>
          {order.totalPriceLabel}
        </span>
        <button
          type='button'
          className='col-span-3 col-start-1 row-start-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-800 hover:border-gray-600 active:border-gray-800'
          onClick={goToOrder}
        >
          Подробнее
        </button>
      </div>

      <div className='hidden h-14 items-center justify-between rounded-md bg-white px-6 py-2 shadow-md lg:flex'>
        <div className='flex min-w-0 items-center gap-9'>
          <span className='flex-shrink-0 text-base text-gray-800'>{order.date}</span>
          <span className='flex-shrink-0 text-base text-gray-600'>{order.time}</span>
          <span className='flex-1 truncate text-base text-gray-800'>«{order.restaurantName}»</span>
        </div>
        <div className='flex flex-shrink-0 items-center gap-9'>
          <span className='flex-shrink-0 text-base font-bold text-gray-800'>
            {order.totalPriceLabel}
          </span>
          <span className='flex-shrink-0 text-base text-green-500'>{order.statusLabel}</span>
          <button
            type='button'
            className='min-w-[15.5rem] rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-base font-bold text-gray-800 hover:border-gray-600 active:border-gray-800'
            onClick={goToOrder}
          >
            Подробнее
          </button>
        </div>
      </div>
    </>
  )
}
