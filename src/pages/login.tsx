import { FormEvent, useState } from 'react'
import { useRouter } from 'next/router'

import { logIn } from '@/api/log-in'
import LoginForm from '@/components/loginPage/loginForm'
import LoginLinks from '@/components/loginPage/loginLinks'
import PrimaryButton from '@/components/ui/buttons/primaryButton'

export default function LoginPage() {
  const router = useRouter()
  const [message, setMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    try {
      await logIn({
        email: String(formData.get('email')),
        password: String(formData.get('password')),
      })
      router.push('/')
    } catch {
      setMessage('Не удалось войти в аккаунт')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[url('/images/bgImageM.jpg')] bg-cover bg-fixed bg-center lg:bg-[url('/images/bgImage.jpg')]">
      <div className='mt-7 flex w-full max-w-[23.75rem] flex-col lg:mt-0 lg:rounded-xl lg:border lg:border-gray-300 lg:bg-white lg:shadow-lg'>
        <div className='flex flex-col gap-8 px-5 py-6 lg:px-6 lg:py-10'>
          <form className='flex flex-col gap-8 lg:gap-8' onSubmit={handleSubmit}>
            <div className='flex flex-col gap-5 lg:gap-6'>
              <h2 id='login' className='font-roboto text-xl font-bold text-gray-800 lg:text-2xl'>
                Вход в аккаунт
              </h2>
              <LoginForm />
            </div>
            <PrimaryButton type='submit'>Войти</PrimaryButton>
            {message && <span className='text-sm text-gray-500'>{message}</span>}
          </form>
          <LoginLinks />
        </div>
      </div>
    </div>
  )
}
