import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'

import { getCurrentUser } from '@/api/get-current-user'
import { getOrder } from '@/api/orders/get-order'
import { getOrders } from '@/api/orders/get-orders'
import OrderDetailsCard from '@/components/orderInfoPage/orderDetailsCard'
import OrderReviewForm from '@/components/orderInfoPage/orderReviewForm'
import RepeatOrderButton from '@/components/ui/buttons/repeatOrderButton'
import Header from '@/components/ui/headers/header'
import HeaderMobile from '@/components/ui/headers/headerMobile'
import PageTitleWithBack from '@/components/ui/pageTitleWithBack'

export default function OrderInfoPage() {
  const router = useRouter()
  const id = typeof router.query.id === 'string' ? router.query.id : null
  const currentUser = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  })

  const fallbackOrders = useQuery({
    queryKey: ['orders', currentUser.data?.id],
    queryFn: () => getOrders(currentUser.data?.id),
    enabled: !id && Boolean(currentUser.data?.id),
  })

  const orderId = id ?? fallbackOrders.data?.[0]?.id

  const { data, isError, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId as string),
    enabled: Boolean(orderId),
  })

  return (
    <div className="min-h-screen bg-[url('/images/bgImageM.jpg')] bg-cover bg-fixed bg-center lg:bg-gray-100 lg:bg-none">
      <HeaderMobile />
      <Header />
      <div className='mx-auto flex w-full max-w-screen-xl flex-col gap-6 px-5 py-5 lg:px-12 lg:py-8'>
        <PageTitleWithBack title='Информация о заказе' />
        {isLoading || fallbackOrders.isLoading ? (
          'Загрузка заказа...'
        ) : isError || fallbackOrders.isError || !data ? (
          'Не удалось загрузить заказ'
        ) : (
          <div className='flex flex-col gap-6 lg:flex-row lg:gap-3'>
            <div className='flex flex-col gap-3 lg:w-1/2'>
              <OrderDetailsCard order={data} />
              <RepeatOrderButton order={data} />
            </div>
            <div className='flex h-full flex-col gap-2 lg:w-1/2'>
              {data.status === 'delivered' ? (
                <OrderReviewForm order={data} />
              ) : (
                <div className='rounded-xl border border-gray-300 bg-white p-6 text-sm text-gray-600 shadow-md shadow-gray-300'>
                  Оценка будет доступна после доставки заказа.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
