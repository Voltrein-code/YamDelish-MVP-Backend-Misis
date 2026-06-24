import { useState } from 'react'
import { MinusIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { removeInCart } from '@/api/remove-in-cart'
import { updateCart } from '@/api/update-cart'
import { Menu } from '@/types/menu'

export const CartCard: React.FC<Menu> = ({ id, name, price, quantity = 1, description, image }) => {
  const [count, setCount] = useState(quantity)
  const queryClient = useQueryClient()

  const updateCartMutation = useMutation({
    mutationFn: (newQuantity: number) =>
      updateCart({
        cartItemId: id ?? '',
        quantity: newQuantity,
      }),
    onSuccess: (_cart, newQuantity) => {
      setCount(Math.max(0, newQuantity))
      queryClient.invalidateQueries({ queryKey: ['getCart'] })
    },
  })

  const removeCartMutation = useMutation({
    mutationFn: () =>
      removeInCart({
        cartItemId: id ?? '',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getCart'] })
    },
  })

  const handleQuantityChange = (nextQuantity: number) => {
    if (!id) return

    updateCartMutation.mutate(nextQuantity)
  }

  return (
    <div className='grid grid-cols-[5rem_1fr_auto] grid-rows-[auto_auto_auto] gap-y-2 rounded-md bg-white px-4 py-3 shadow-md lg:max-w-[55rem] lg:grid-cols-[5rem_1fr_10rem] lg:gap-y-0 lg:px-4 lg:pb-4 lg:pt-3'>
      <img
        src={image}
        alt={name}
        className='col-start-1 row-span-2 row-start-1 h-20 w-20 rounded-md object-cover lg:row-span-3'
      />
      <h3 className='col-start-2 row-start-1 ml-3 self-center truncate text-xs text-gray-800 lg:col-start-2 lg:row-start-1 lg:text-base lg:font-bold'>
        {name}
      </h3>
      <button
        type='button'
        aria-label='Удалить из корзины'
        className='col-start-3 row-start-1 flex h-6 w-6 items-center justify-center justify-self-end lg:col-start-3 lg:row-start-1'
        onClick={() => id && removeCartMutation.mutate()}
      >
        <XMarkIcon aria-hidden='true' className='h-4 w-4 scale-125' />
      </button>
      <p className='col-span-2 col-start-2 row-start-2 ml-3 line-clamp-3 text-left text-xs text-gray-600 lg:col-span-1 lg:col-start-2 lg:row-start-2 lg:mx-3 lg:line-clamp-2 lg:text-sm'>
        {description}
      </p>
      <span className='font-roboto lg:font-Roboto col-start-1 row-start-3 self-end truncate text-xl font-bold text-green-500 lg:col-start-2 lg:row-start-3 lg:ml-3 lg:self-auto lg:text-2xl'>
        {price} ₽
      </span>
      <div className='col-span-3 col-start-2 row-start-3 mt-auto flex w-full items-center gap-1 lg:col-span-1 lg:col-start-3 lg:row-span-2 lg:row-start-2 lg:self-center'>
        <button
          type='button'
          aria-label='Убрать'
          disabled={updateCartMutation.isPending}
          className='flex h-9 w-10 items-center justify-center rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 lg:h-10'
          onClick={() => handleQuantityChange(count - 1)}
        >
          <MinusIcon className='h-4 w-4 text-gray-100' />
        </button>
        <div className='flex h-9 flex-1 items-center justify-center rounded-md border border-gray-300 bg-white text-base font-bold text-gray-800 lg:h-10'>
          {count}
        </div>
        <button
          type='button'
          aria-label='Добавить'
          disabled={updateCartMutation.isPending}
          className='flex h-9 w-10 items-center justify-center rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 lg:h-10'
          onClick={() => handleQuantityChange(count + 1)}
        >
          <PlusIcon className='h-4 w-4 text-gray-100' />
        </button>
      </div>
    </div>
  )
}
