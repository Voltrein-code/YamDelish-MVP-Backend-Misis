'use client'

import { useRouter } from 'next/router'
import { ArrowLongLeftIcon } from '@heroicons/react/24/outline'

interface PageTitleWithBackProps {
  title: string
}

export default function PageTitleWithBack({ title }: PageTitleWithBackProps) {
  const router = useRouter()

  return (
    <div className='flex items-center gap-2'>
      <ArrowLongLeftIcon
        onClick={() => router.back()}
        aria-hidden='true'
        className='h-6 w-6 text-gray-800'
        style={{ cursor: 'pointer' }}
      />
      <h1 className='font-roboto text-2xl font-bold text-gray-800 lg:text-3xl'>{title}</h1>
    </div>
  )
}
