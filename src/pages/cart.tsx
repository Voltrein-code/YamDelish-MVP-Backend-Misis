'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'
import { ArrowLongLeftIcon } from '@heroicons/react/24/solid'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getCart } from '@/api/get-cart'
import { getCurrentUser } from '@/api/get-current-user'
import { sendOrder } from '@/api/send-order'
import OrderSummary from '@/components/cartPage/orderSummary'
import { CartList } from '@/components/lists/cartList'
import Header from '@/components/ui/headers/header'
import HeaderMobile from '@/components/ui/headers/headerMobile'

export default function CartPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')

  const currentUser = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  })

  const userId = currentUser.data?.id

  const { data, isLoading, isError } = useQuery({
    queryKey: ['getCart', userId],
    queryFn: () => getCart(userId),
    enabled: Boolean(userId),
  })

  const checkoutMutation = useMutation({
    mutationFn: () =>
      sendOrder({
        userId,
        // Адрес хранится в seed-профиле пользователя, поэтому отдельная форма доставки не нужна.
        address: '',
        paymentMethod: 'Онлайн, карта тестовая',
      }),
    onSuccess: order => {
      setMessage('Заказ оформлен')
      queryClient.invalidateQueries({ queryKey: ['getCart'] })
      queryClient.invalidateQueries({ queryKey: ['orders', userId] })
      router.push({
        pathname: '/order-info',
        query: { id: order.id },
      })
    },
    onError: () => {
      setMessage('Не удалось оформить заказ')
    },
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
          <h1 className='font-roboto text-2xl font-bold text-gray-800 lg:text-3xl'>Ваша корзина</h1>
        </div>
        <div className='flex flex-col gap-6 lg:flex-row'>
          {currentUser.isError || isError ? (
            'Упс... Похоже произошла ошибка, обратитесь пожалуйста в тех поддержку'
          ) : (
            <>
              <div className='w-full lg:w-3/4'>
                {currentUser.isLoading || isLoading || !data?.items.length ? (
                  'Ваша корзина пуста'
                ) : (
                  <CartList items={data.items} />
                )}
                {message && <span className='mt-2 block text-sm text-gray-500'>{message}</span>}
              </div>
              <OrderSummary
                totalPrice={`${data?.totalPrice ?? 0} ₽`}
                totalItems={String(data?.totalItems ?? 0)}
                disabled={
                  currentUser.isLoading ||
                  isLoading ||
                  !data?.items.length ||
                  checkoutMutation.isPending
                }
                onCheckout={() => checkoutMutation.mutate()}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
