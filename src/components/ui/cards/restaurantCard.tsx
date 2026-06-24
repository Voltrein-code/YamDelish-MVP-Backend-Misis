'use client'

import { JSX } from 'react'
import { useRouter } from 'next/router'

import { DiscountIcon } from '@/components/icons/discountIcon'
import { Star } from '@/components/icons/star'
import { Restaurant } from '@/types/restaurants'

export const RestaurantCard: ({
  id,
  name,
  rating,
  description,
  kitchenType,
  time,
  price,
  image,
}: Restaurant) => JSX.Element = ({
  id,
  name,
  rating,
  description,
  kitchenType,
  time,
  price,
  image,
}) => {
  const router = useRouter()

  const goToMenu = (currentId: string) => {
    router.push({
      pathname: `/menu/${id}`,
      query: { name: encodeURIComponent(name) },
    })
  }

  return (
    <>
      <div className='flex flex-col gap-1 rounded-md bg-white px-4 pb-4 pt-2 shadow-md lg:hidden'>
        <h3 className='font-roboto truncate text-center text-base font-bold text-gray-800'>
          {name}
        </h3>
        <img src={image} alt={name} className='h-32 w-full rounded-xl object-cover' />
        <div className='flex items-center justify-between gap-2'>
          <div className='flex space-x-2'>
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={
                  index < rating
                    ? 'fill-yellow-500 stroke-yellow-500'
                    : 'fill-white stroke-gray-800'
                }
              />
            ))}
          </div>
          <p className='truncate text-xs text-gray-600'>{kitchenType}</p>
        </div>
        <p className='line-clamp-2 flex-1 text-left text-xs text-gray-800'>{description}</p>
        <div className='mt-1 flex justify-between gap-4 text-xs text-gray-600'>
          <span className='flex items-center'>{time}</span>
          <span className='flex items-center'>
            <DiscountIcon aria-hidden='true' className='mr-1 h-4 w-4' />
            {price}
          </span>
        </div>
        <button
          onClick={() => goToMenu(id)}
          type='button'
          className='mt-2 w-full rounded-md bg-blue-500 py-2 text-sm font-bold text-gray-100 hover:bg-blue-600 active:bg-blue-700'
        >
          Смотреть меню
        </button>
      </div>

      <div className='hidden min-w-[14rem] max-w-[20rem] flex-grow flex-col items-start gap-1.5 rounded-md bg-white px-4 pb-4 pt-1.5 text-left shadow-md lg:flex'>
        <h3 className='font-roboto w-full truncate text-center text-xl font-bold text-gray-800'>
          {name}
        </h3>
        <img src={image} alt={name} className='h-[7.5rem] w-full rounded-lg object-cover' />
        <div className='flex items-center space-x-2'>
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={
                index < rating ? 'fill-yellow-500 stroke-yellow-500' : 'fill-white stroke-gray-800'
              }
            />
          ))}
        </div>
        <p className='line-clamp-2 w-full flex-[2] text-sm text-gray-800'>{description}</p>
        <div className='grid w-full flex-[1] grid-cols-[max-content,1fr] gap-2 text-sm text-gray-600'>
          <span className='whitespace-nowrap'>Тип кухни:</span>
          <span className='break-words text-right'>{kitchenType}</span>
        </div>
        <div className='flex w-full justify-between text-sm text-gray-600'>
          <span>Время доставки:</span>
          <span>{time}</span>
        </div>
        <div className='flex w-full justify-between text-xs text-gray-600'>
          <span className='flex items-center'>
            <DiscountIcon aria-hidden='true' className='mr-1 h-4 w-4' />
            Средний чек:
          </span>
          <span>{price}</span>
        </div>
        <button
          onClick={() => goToMenu(id)}
          type='button'
          className='mt-4 w-full rounded-md bg-blue-500 py-2 text-base font-bold text-gray-100 hover:bg-blue-600 active:bg-blue-700'
        >
          Смотреть меню
        </button>
      </div>
    </>
  )
}
