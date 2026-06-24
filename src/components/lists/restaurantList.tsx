import { RestaurantCard } from '@/components/ui/cards/restaurantCard'
import { Restaurant } from '@/types/restaurants'

export const RestaurantList = ({ list }: { list: Restaurant[] }) => {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {list.map(restaurant => (
        <RestaurantCard key={restaurant.id} {...restaurant} />
      ))}
    </div>
  )
}
