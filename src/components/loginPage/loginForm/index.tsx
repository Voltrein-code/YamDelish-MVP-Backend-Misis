import Link from 'next/link'

import FormInput from '@/components/ui/formInput'

export default function LoginForm() {
  return (
    <div aria-labelledby='login' className='flex flex-col gap-5'>
      <FormInput
        label='Email'
        id='email'
        type='email'
        placeholder='ivanov@yandex.ru'
        autoComplete='username'
        pattern='^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        minLength={5}
        maxLength={100}
      />

      <div className='flex flex-col gap-0.5 lg:gap-1'>
        <FormInput
          label='Пароль'
          id='password'
          type='password'
          placeholder='******'
          autoComplete='current-password'
          pattern='^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$'
          minLength={6}
          maxLength={100}
        />
        <Link
          href='/passwordRestore'
          aria-label='Перейти на страницу восстановления пароля'
          className='self-end text-sm text-gray-500 hover:underline lg:text-base'
        >
          Забыли пароль?
        </Link>
      </div>
    </div>
  )
}
