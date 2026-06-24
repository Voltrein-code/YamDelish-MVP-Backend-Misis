import { useState } from 'react'
import { useRouter } from 'next/router'
import { MinusIcon, PlusIcon } from '@heroicons/react/24/solid'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { addToCart } from '@/api/add-to-cart'
import { updateCart } from '@/api/update-cart'
import { Basket } from '@/components/icons/basket'
import { CartResponse, Menu } from '@/types/menu'

export const MenuCard: React.FC<Menu> = ({ id, name, price, description, image }) => {
  const [count, setCount] = useState(0)
  const [cartItemId, setCartItemId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const queryClient = useQueryClient()
  const router = useRouter()

  const syncCartItem = (cart: CartResponse) => {
    const item = cart.items.find(cartItem => cartItem.dishId === id)
    setCount(item?.quantity ?? 0)
    setCartItemId(item?.id ?? null)
  }

  const addToCartMutation = useMutation({
    mutationFn: (quantity: number) =>
      addToCart({
        dishId: id ?? '',
        quantity,
      }),
    onSuccess: (cart: CartResponse) => {
      syncCartItem(cart)
      setMessage('')
      queryClient.invalidateQueries({ queryKey: ['getCart'] })
    },
    onError: (error: Error & { status?: number }) => {
      if (error.status === 401) {
        router.push('/login')
        return
      }
      setMessage(error.message)
    },
  })

  const updateCartMutation = useMutation({
    mutationFn: (quantity: number) =>
      updateCart({
        cartItemId: cartItemId ?? '',
        quantity,
      }),
    onSuccess: (cart: CartResponse) => {
      syncCartItem(cart)
      setMessage('')
      queryClient.invalidateQueries({ queryKey: ['getCart'] })
    },
    onError: () => setMessage('Не удалось изменить количество'),
  })

  const handleAdd = () => {
    if (!id) return
    addToCartMutation.mutate(1)
  }

  const handleRemove = () => {
    if (!cartItemId) return
    updateCartMutation.mutate(Math.max(0, count - 1))
  }

  return (
    <div className='flex h-full flex-col gap-2 rounded-md bg-white px-4 pb-3 pt-2 shadow-md lg:px-4 lg:pb-4 lg:pt-3'>
      <img src={image} alt={name} className='h-32 w-full rounded-xl object-cover' />
      <div className='flex items-center gap-1'>
        <span className='font-roboto flex items-center truncate text-xl font-bold text-green-500 lg:hidden'>
          {price}
        </span>
        <h3 className='truncate text-left text-xs text-gray-800 lg:text-sm'>{name}</h3>
      </div>
      <p className='line-clamp-3 flex-1 text-left text-xs text-gray-600'>{description}</p>
      <span className='font-roboto hidden text-xl font-bold text-green-500 lg:block'>{price}</span>
      {count === 0 ? (
        <button
          type='button'
          aria-label='Добавить в корзину'
          className='mt-auto flex w-full items-center justify-center rounded-md bg-blue-500 py-2 hover:bg-blue-600 active:bg-blue-700'
          disabled={addToCartMutation.isPending}
          onClick={handleAdd}
        >
          <Basket className='h-6 w-6 text-white' />
        </button>
      ) : (
        <div className='mt-auto flex w-full items-center gap-1'>
          <button
            type='button'
            aria-label='Убрать'
            className='flex h-10 w-10 items-center justify-center rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
            disabled={updateCartMutation.isPending}
            onClick={handleRemove}
          >
            <MinusIcon className='h-5 w-5 text-white' />
          </button>

          <div className='flex h-10 flex-1 items-center justify-center rounded-md border border-gray-300 bg-white text-base font-bold text-gray-800'>
            {count}
          </div>

          <button
            type='button'
            aria-label='Добавить'
            className='flex h-10 w-10 items-center justify-center rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
            disabled={addToCartMutation.isPending}
            onClick={handleAdd}
          >
            <PlusIcon className='h-5 w-5 text-white' />
          </button>
        </div>
      )}
      {message && <span className='text-xs text-red-600'>{message}</span>}
    </div>
  )
}
