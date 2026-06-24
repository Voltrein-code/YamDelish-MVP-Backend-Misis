'use client'

import React from 'react'
import { useRouter } from 'next/router'
import { ArrowLongLeftIcon } from '@heroicons/react/24/solid'
import { useQuery } from '@tanstack/react-query'

import { getCurrentUser } from '@/api/get-current-user'
import { getOrders } from '@/api/orders/get-orders'
import { OrderCard } from '@/components/ui/cards/orderCard'
import Header from '@/components/ui/headers/header'
import HeaderMobile from '@/components/ui/headers/headerMobile'

export default function OrderHistoryPage() {
  const router = useRouter()
  const currentUser = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  })

  const { data, isError, isLoading } = useQuery({
    queryKey: ['orders', currentUser.data?.id],
    queryFn: () => getOrders(currentUser.data?.id),
    enabled: Boolean(currentUser.data?.id),
  })

  return (
    <div className="min-h-screen bg-[url('/images/bgImageM.jpg')] bg-cover bg-fixed bg-center lg:bg-gray-100 lg:bg-none">
      <HeaderMobile />
      <Header />
      <div className='mx-auto flex w-full max-w-screen-xl flex-col gap-6 px-5 py-5 lg:px-12 lg:py-8'>
        <div className='flex items-center gap-2'>
          <ArrowLongLeftIcon
            onClick={() => router.back()}
            aria-hidden='true'
            className='h-6 w-6 text-gray-800 lg:hidden'
          />
          <h1 className='font-roboto text-2xl font-bold text-gray-800 lg:text-3xl'>Все заказы</h1>
        </div>
        <div className='flex flex-col gap-1'>
          {(currentUser.isLoading || isLoading) && 'Загрузка заказов...'}
          {(currentUser.isError || isError) && 'Не удалось загрузить заказы'}
          {!isLoading && !isError && data?.length === 0 && 'Заказов пока нет'}
          {!isLoading && !isError && data?.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      </div>
    </div>
  )
}
