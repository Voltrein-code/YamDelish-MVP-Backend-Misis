import { FormEvent, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'

import { getCurrentUser } from '@/api/get-current-user'
import { updateUser } from '@/api/update-user'
import FormInput from '@/components/ui/formInput'

export default function ProfileForm() {
  const [message, setMessage] = useState('')
  const { data, isError, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  })

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      setMessage('Профиль сохранён')
    },
    onError: () => {
      setMessage('Не удалось сохранить профиль')
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!data) return

    const formData = new FormData(event.currentTarget)

    updateUserMutation.mutate({
      id: data.id,
      name: String(formData.get('firstName')),
      surname: String(formData.get('lastName')),
      phone: String(formData.get('phone')),
      address: String(formData.get('address')),
    })
  }

  if (isError) {
    return <span className='text-sm text-red-600'>Не удалось загрузить профиль</span>
  }

  if (isLoading || !data) {
    return <span className='text-sm text-gray-500'>Загрузка профиля...</span>
  }

  return (
    <form className='flex w-full flex-col gap-3' onSubmit={handleSubmit}>
      <div className='flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-3'>
        <FormInput id='firstName' label='Имя' type='text' defaultValue={data.name} />
        <FormInput id='lastName' label='Фамилия' type='text' defaultValue={data.surname} />
      </div>

      <div className='flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-4'>
        <FormInput id='email' label='Email' type='email' defaultValue={data.email} readOnly />
        <FormInput id='phone' label='Телефон' type='text' defaultValue={data.phone ?? ''} />
      </div>

      <div className='flex flex-col gap-2'>
        <FormInput id='address' label='Адрес' type='text' defaultValue={data.address ?? ''} />
      </div>

      <button
        type='submit'
        className='mt-3 rounded-lg bg-blue-500 py-2 text-base font-bold text-gray-100 hover:bg-blue-600 hover:text-gray-100 active:bg-blue-700 active:text-white'
      >
        Сохранить
      </button>
      {message && <span className='text-sm text-gray-500'>{message}</span>}
    </form>
  )
}
