import { FormEvent, useState } from 'react'
import { useRouter } from 'next/router'

import { sendRegistration } from '@/api/send-registration'
import RegistrationForm from '@/components/registrationPage/registrationForm'
import RegistrationLinks from '@/components/registrationPage/registrationLinks'
import PrimaryButton from '@/components/ui/buttons/primaryButton'

export default function RegistrationPage() {
  const router = useRouter()
  const [message, setMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const password = String(formData.get('password'))
    const passwordConfirm = String(formData.get('passwordConfirm'))

    if (password !== passwordConfirm) {
      setMessage('Пароли должны совпадать')
      return
    }

    try {
      await sendRegistration({
        name: String(formData.get('firstName')),
        surname: String(formData.get('lastName')),
        email: String(formData.get('email')),
        password,
        phone: String(formData.get('phone')) || undefined,
        address: String(formData.get('address')) || undefined,
      })
      router.push('/')
    } catch {
      setMessage('Не удалось зарегистрироваться')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[url('/images/bgImageM.jpg')] bg-cover bg-fixed bg-center lg:bg-[url('/images/bgImage.jpg')]">
      <div className='mt-5 flex w-full max-w-[23.75rem] flex-col lg:mt-0 lg:rounded-xl lg:border lg:border-gray-300 lg:bg-white lg:shadow-lg'>
        <div className='flex flex-col gap-7 px-5 py-6 lg:gap-8 lg:px-6 lg:py-10'>
          <form className='flex flex-col gap-7 lg:gap-8' onSubmit={handleSubmit}>
            <div className='flex flex-col gap-6 lg:gap-6'>
              <h2
                id='registration'
                className='font-roboto text-xl font-bold text-gray-800 lg:text-2xl'
              >
                Регистрация
              </h2>
              <RegistrationForm />
            </div>
            <PrimaryButton type='submit'>Зарегистрироваться</PrimaryButton>
            {message && <span className='text-sm text-gray-500'>{message}</span>}
          </form>
          <RegistrationLinks />
        </div>
      </div>
    </div>
  )
}
