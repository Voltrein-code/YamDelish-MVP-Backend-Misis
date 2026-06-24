import { Dispatch, Fragment, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Listbox } from '@headlessui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'

import { MenuGroup } from '@/types/menu'
import { Restaurant } from '@/types/restaurants'
import { cn } from '@/utils/cn'

interface FiltersProps {
  restaurantList: Restaurant[] | null
  setRestaurantList: Dispatch<SetStateAction<Restaurant[] | null>>
}

interface FiltersMenuProps {
  menu: MenuGroup
  setFilterGroup: Dispatch<SetStateAction<string | null>>
}

export function Filters({ restaurantList, setRestaurantList }: FiltersProps) {
  const [selectedKitchenType, setSelectedKitchenType] = useState<string | null>(null)
  const [selectedRating, setSelectedRating] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const [kitchenTypes, setKitchenTypes] = useState<string[]>([])
  const [ratings, setRatings] = useState<string[]>([])
  const [deliveryTimes, setDeliveryTimes] = useState<string[]>([])

  const closeFilters = () => {
    setSelectedKitchenType(null)
    setSelectedRating(null)
    setSelectedTime(null)
    setRestaurantList(null)
  }

  useEffect(() => {
    if (restaurantList && restaurantList.length > 0) {
      const newKitchenTypes = [...new Set(restaurantList.map(rest => rest.kitchenType))]
      const newRatings = [...new Set(restaurantList.map(rest => String(rest.rating)))]
      const newDeliveryTimes = [...new Set(restaurantList.map(rest => rest.time))]

      setKitchenTypes(newKitchenTypes)
      setRatings(newRatings)
      setDeliveryTimes(newDeliveryTimes)
    }
  }, [restaurantList])

  const filteredRestaurants = useMemo(() => {
    if (!restaurantList?.length) return []
    return restaurantList.filter(rest => {
      const matchKitchen = !selectedKitchenType || rest.kitchenType === selectedKitchenType
      const matchRating = !selectedRating || rest.rating === +selectedRating
      const matchTime = !selectedTime || rest.time === selectedTime

      return matchKitchen && matchRating && matchTime
    })
  }, [restaurantList, selectedKitchenType, selectedRating, selectedTime])

  useEffect(() => {
    if (filteredRestaurants) {
      setRestaurantList(filteredRestaurants)
    }
  }, [filteredRestaurants])

  const renderListbox = (
    placeholder: string,
    options: string[],
    selected: string | null,
    setSelected: (value: string) => void,
  ) => (
    <div className='relative w-full'>
      <Listbox value={selected ?? undefined} onChange={setSelected}>
        {({ open }) => (
          <>
            <Listbox.Button
              className={cn(
                'w-full cursor-pointer rounded-md border bg-white py-2 pl-3 pr-10 text-left text-sm',
                open ? 'border-blue-500' : 'border-gray-300',
              )}
            >
              {selected || placeholder}
              {open ? (
                <ChevronUpIcon
                  aria-hidden='true'
                  className='absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 transform text-gray-500'
                />
              ) : (
                <ChevronDownIcon
                  aria-hidden='true'
                  className='absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 transform text-gray-500'
                />
              )}
            </Listbox.Button>
            <Listbox.Options className='absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg'>
              {options.map(option => (
                <Listbox.Option
                  key={option}
                  value={option}
                  className={({ active }) =>
                    cn(
                      'cursor-pointer select-none py-2 pl-4 text-sm',
                      active && 'bg-gray-100 text-blue-500',
                    )
                  }
                >
                  {option}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </>
        )}
      </Listbox>
    </div>
  )

  return (
    <div className='flex w-full flex-col gap-2 lg:flex-row lg:gap-1.5 lg:self-start'>
      <div className='lg:w-[200px]'>
        {renderListbox('Тип кухни', kitchenTypes, selectedKitchenType, setSelectedKitchenType)}
      </div>
      <div className='lg:w-[200px]'>
        {renderListbox('Рейтинг ресторана', ratings, selectedRating, setSelectedRating)}
      </div>
      <div className='lg:w-[200px]'>
        {renderListbox('Время доставки', deliveryTimes, selectedTime, setSelectedTime)}
      </div>
      {selectedKitchenType || selectedRating || selectedTime ? (
        <div className='lg:w-[200px]'>
          <button
            onClick={() => closeFilters()}
            type='button'
            className='w-full rounded-md bg-blue-500 py-2 text-sm font-bold text-gray-100 hover:bg-blue-600 active:bg-blue-700'
          >
            Сброс
          </button>
        </div>
      ) : (
        ''
      )}
    </div>
  )
}

export function FiltersMenu({ menu, setFilterGroup }: FiltersMenuProps) {
  const [menuCategories, setMenuCategories] = useState<string[] | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    setMenuCategories(Object.keys(menu).map(groupName => groupName))
  }, [])

  useEffect(() => {
    setFilterGroup(selectedCategory)
  }, [selectedCategory])

  return (
    <div className='relative lg:w-[200px] lg:self-start'>
      <Listbox value={selectedCategory} onChange={setSelectedCategory}>
        {({ open }) => (
          <>
            <Listbox.Button
              className={cn(
                'w-full cursor-pointer rounded-md border bg-white py-2 pl-3 pr-10 text-left text-sm',
                open ? 'border-blue-500' : 'border-gray-300',
              )}
            >
              {selectedCategory || 'Категория'}
              {open ? (
                <ChevronUpIcon
                  aria-hidden='true'
                  className='absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 transform text-gray-500'
                />
              ) : (
                <ChevronDownIcon
                  aria-hidden='true'
                  className='absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 transform text-gray-500'
                />
              )}
            </Listbox.Button>
            <Listbox.Options className='absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg'>
              {menuCategories && (
                <Fragment>
                  {menuCategories.map(category => (
                    <Listbox.Option
                      key={category}
                      value={category}
                      className={({ active }) =>
                        cn(
                          'cursor-pointer select-none py-2 pl-4 text-sm',
                          active && 'bg-gray-100 text-blue-500',
                        )
                      }
                    >
                      {category}
                    </Listbox.Option>
                  ))}
                </Fragment>
              )}
            </Listbox.Options>
          </>
        )}
      </Listbox>
    </div>
  )
}
