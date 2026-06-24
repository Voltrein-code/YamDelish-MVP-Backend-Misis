import Link from 'next/link'

export default function PasswordRestoreLinks() {
  return (
    <div className='flex flex-col gap-1 lg:gap-2'>
      <span className='text-xs text-gray-500 lg:text-sm'>Уже зарегистрированы?</span>
      <Link href='/login' className='text-sm font-bold text-blue-600 hover:underline'>
        Войти в аккаунт
      </Link>
    </div>
  )
}
