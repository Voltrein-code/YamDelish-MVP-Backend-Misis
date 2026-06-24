import { Tab } from '@headlessui/react'

const tabs = [
  { id: 'all', label: 'Все' },
  { id: 'favorites', label: 'Избранные' },
  { id: 'recent', label: 'Заказывали недавно' },
]

export default function Tabs({
  activeTab,
  onChangeTab,
}: {
  activeTab: string
  onChangeTab: (tab: string) => void
}) {
  return (
    <Tab.Group
      selectedIndex={tabs.findIndex(tab => tab.id === activeTab)}
      onChange={index => onChangeTab(tabs[index].id)}
    >
      <Tab.List className='grid w-full grid-cols-[1fr_1fr_2fr] gap-4 border-b border-gray-200 md:grid-cols-3 lg:hidden'>
        {tabs.map(({ id, label }) => (
          <Tab
            key={id}
            className={({ selected }) =>
              `relative text-sm ${selected ? 'font-bold text-blue-500' : 'text-gray-500'}`
            }
          >
            {label}
            {id === activeTab && (
              <span className='absolute bottom-0 left-0 h-0.5 w-full bg-blue-500' />
            )}
          </Tab>
        ))}
      </Tab.List>
    </Tab.Group>
  )
}
