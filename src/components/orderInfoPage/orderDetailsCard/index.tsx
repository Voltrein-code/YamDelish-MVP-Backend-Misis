import { DishCard } from '@/components/ui/cards/dish'
import { Order } from '@/types/order'

export default function OrderDetailsCard({ order }: { order: Order }) {
  return (
    <div className='flex h-full flex-col gap-2 rounded-xl border border-gray-300 bg-white p-6 shadow-md shadow-gray-300 lg:gap-4'>
      <div className='flex justify-start'>
        <div className='flex w-full gap-3'>
          <span className='text-sm font-bold text-gray-500 lg:text-base'>{order.date}</span>
          <span className='text-sm font-bold text-gray-500 lg:text-base'>{order.time}</span>
        </div>
        <span className='text-sm text-green-500 lg:text-base'>{order.statusLabel}</span>
      </div>

      <h3 className='lg:font-roboto text-sm font-bold text-gray-800 lg:text-xl'>
        «{order.restaurantName}»
      </h3>

      <div className='flex flex-col gap-1'>
        {order.items.map(item => (
          <div key={item.id} className='flex flex-col gap-1'>
            <DishCard item={item} />
            <div aria-hidden='true' className='hidden h-px w-full bg-gray-300 lg:block'></div>
          </div>
        ))}
      </div>

      <div className='flex justify-end gap-2'>
        <span className='self-end text-xs text-gray-600 lg:text-sm'>Итого:</span>
        <span className='lg:font-roboto text-sm font-bold text-gray-800 lg:text-xl'>
          {order.totalPriceLabel}
        </span>
      </div>

      <div aria-hidden='true' className='h-px w-full bg-gray-300 lg:hidden'></div>

      <div className='flex flex-col gap-2 lg:gap-4'>
        <span className='text-xs text-gray-800 lg:text-sm lg:font-bold'>Детали доставки:</span>

        <div className='flex flex-col gap-2 xl:flex-row xl:justify-between'>
          <DetailRow label='Адрес' value={order.address} />
          <DetailRow label='Оплата' value={order.paymentMethod} />
        </div>

        <div className='flex flex-col lg:flex-row lg:items-center lg:gap-2'>
          <span className='text-xs text-gray-400'>Курьер</span>
          <div className='flex justify-between lg:gap-2'>
            <span className='line-clamp-2 break-words text-xs text-gray-800 lg:text-base'>
              {order.courierName ?? 'Курьер назначается'}
            </span>
            <span className='line-clamp-2 break-words text-xs text-gray-800 lg:text-base'>
              {order.courierPhone ?? ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-center justify-start gap-2'>
      <span className='text-xs text-gray-400'>{label}</span>
      <span className='line-clamp-3 break-words text-xs text-gray-800 lg:text-base'>{value}</span>
    </div>
  )
}
