import { FormEvent, useState } from 'react'

import { restorePass } from '@/api/restore-pass'
import PasswordRestoreForm from '@/components/passwordRestorePage/passwordRestoreForm'
import PasswordRestoreLinks from '@/components/passwordRestorePage/passwordRestoreLinks'
import PrimaryButton from '@/components/ui/buttons/primaryButton'

export default function PasswordRestorePage() {
  const [message, setMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    try {
      const result = await restorePass(String(formData.get('email')))
      setMessage(result.message)
    } catch {
      setMessage('Не удалось обработать восстановление пароля')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[url('/images/bgImageM.jpg')] bg-cover bg-fixed bg-center lg:bg-[url('/images/bgImage.jpg')]">
      <div className='mt-5 flex w-full max-w-[23.75rem] flex-col lg:mt-0 lg:rounded-xl lg:border lg:border-gray-300 lg:bg-white lg:shadow-lg'>
        <div className='flex flex-col gap-9 px-5 py-6 lg:px-6 lg:py-10'>
          <form className='flex flex-col gap-9' onSubmit={handleSubmit}>
            <div className='flex flex-col gap-7'>
              <h2
                id='reset-password'
                className='font-roboto text-xl font-bold text-gray-800 lg:text-2xl'
              >
                Восстановление пароля
              </h2>
              <p className='text-sm text-gray-800 lg:text-base'>
                Укажите почту, на которую регистрировали аккаунт, и мы отправим инструкцию по
                восстановлению пароля.
              </p>
              <PasswordRestoreForm />
            </div>
            <PrimaryButton type='submit'>Восстановить</PrimaryButton>
            {message && <span className='text-sm text-gray-500'>{message}</span>}
          </form>
          <PasswordRestoreLinks />
        </div>
      </div>
    </div>
  )
}
