'use client'

import React, { Fragment, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getRestaurantList } from '@/api/get-restaurant-list'
import { RestaurantList } from '@/components/lists/restaurantList'
import { Filters } from '@/components/ui/filters'
import Header from '@/components/ui/headers/header'
import HeaderMobile from '@/components/ui/headers/headerMobile'
import Tabs from '@/components/ui/tabs'
import { Restaurant } from '@/types/restaurants'

export default function MainPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [restaurantList, setRestaurantList] = useState<Restaurant[] | null>(null)
  const [filteredRestaurantList, setFilteredRestaurantList] = useState<Restaurant[] | null>(null)
  const [recent, setRecent] = useState<Restaurant[] | null>(null)
  const [favorite, setFavorite] = useState<Restaurant[] | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['key'],
    queryFn: () => getRestaurantList(),
  })

  const handleChangeTab = (tab: string) => {
    setActiveTab(tab)
  }

  useEffect(() => {
    if (!isLoading && !isError && data) {
      setRestaurantList(data)
      const recents: Restaurant[] = []
      const favorites: Restaurant[] = []
      data.forEach((item: Restaurant) => {
        if (item.recent) {
          recents.push(item)
        }
        if (item.favorite) {
          favorites.push(item)
        }
      })
      recents.length && setRecent(recents)
      favorites.length && setFavorite(favorites)
    }
  }, [data])

  return (
    <div className="min-h-screen bg-[url('/images/bgImageM.jpg')] bg-cover bg-fixed bg-center lg:bg-gray-100 lg:bg-none">
      <HeaderMobile />
      <Header />
      <div className='mx-auto flex w-full max-w-screen-xl flex-col gap-7 px-5 py-5 lg:items-center lg:px-12 lg:py-8'>
        <h1 className='font-roboto text-2xl font-bold text-gray-800 lg:text-3xl'>Все рестораны</h1>
        <div className='lg:hidden'>
          <Tabs activeTab={activeTab} onChangeTab={handleChangeTab} />
        </div>
        <div className={activeTab === 'all' ? 'w-full' : 'hidden w-full lg:block'}>
          <Filters restaurantList={restaurantList} setRestaurantList={setFilteredRestaurantList} />
        </div>
        {!isLoading && !isError && restaurantList ? (
          <Fragment>
            <div className={activeTab === 'all' ? 'w-full' : 'hidden w-full lg:block'}>
              {filteredRestaurantList?.length === 0 ? (
                <p className='text-lg text-gray-600'>
                  Нет ресторанов, соответствующих выбранным фильтрам.
                </p>
              ) : (
                <RestaurantList list={filteredRestaurantList || restaurantList} />
              )}
            </div>
            {recent && (
              <div className={activeTab === 'recent' ? 'w-full' : 'hidden w-full lg:block'}>
                <h2 className='font-roboto hidden self-start text-left text-2xl font-bold text-gray-800 lg:block lg:pt-6'>
                  Недавно заказывали
                </h2>
                <RestaurantList list={recent} />
              </div>
            )}
            {favorite && (
              <div className={activeTab === 'favorites' ? 'w-full' : 'hidden w-full lg:block'}>
                <h2 className='font-roboto hidden self-start text-left text-2xl font-bold text-gray-800 lg:block lg:pt-6'>
                  Избранные рестораны
                </h2>
                <RestaurantList list={favorite} />
              </div>
            )}
          </Fragment>
        ) : (
          'Загрузка ресторанов...'
        )}
      </div>
    </div>
  )
}
