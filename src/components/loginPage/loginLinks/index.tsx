import Link from 'next/link'

export default function LoginLinks() {
  return (
    <div className='flex flex-col gap-1 lg:gap-2'>
      <span className='hidden text-sm text-gray-500 lg:block'>У вас ещё нет аккаунта?</span>
      <span className='text-xs text-gray-500 lg:hidden'>Нет аккаунта?</span>
      <Link
        href='/registration'
        aria-label='Перейти на страницу регистрации'
        className='text-sm font-bold text-blue-600 hover:underline'
      >
        Зарегистрироваться
      </Link>
    </div>
  )
}
