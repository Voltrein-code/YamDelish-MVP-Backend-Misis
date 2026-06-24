import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'

import { getCurrentUser } from '@/api/get-current-user'
import { Basket } from '@/components/icons/basket'
import { BMenu } from '@/components/icons/bMenu'
import { Logo } from '@/components/icons/logo'
import BurgerMenu from '@/components/ui/burgerMenu'

export default function HeaderMobile() {
  const [menuOpen, setMenuOpen] = useState(false)
  const currentUser = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    retry: false,
  })

  return (
    <>
      <header className='flex items-center justify-between rounded-b-xl bg-white p-4 pb-3 pl-10 pr-10 pt-2 lg:hidden'>
        <button
          type='button'
          aria-label='Открыть меню'
          className='flex h-7 w-7 items-center justify-center'
          onClick={() => setMenuOpen(true)}
        >
          <BMenu aria-hidden='true' className='h-6 w-6' />
        </button>
        <Logo aria-hidden='true' />
        <Link
          href={currentUser.data ? '/cart' : '/login'}
          aria-label='Открыть корзину'
          className='flex h-7 w-7 items-center justify-center'
        >
          <Basket aria-hidden='true' className='h-6 w-6' />
        </Link>
      </header>
      {menuOpen && (
        <BurgerMenu
          isAuthenticated={Boolean(currentUser.data)}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </>
  )
}
