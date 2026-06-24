import { MenuCard } from '@/components/ui/cards/menuCard'
import { Menu } from '@/types/menu'

export const MenuList = ({ list }: { list: Menu[] }) => {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {list.map(menu => (
        <MenuCard key={menu.id ?? menu.name} {...menu} />
      ))}
    </div>
  )
}
