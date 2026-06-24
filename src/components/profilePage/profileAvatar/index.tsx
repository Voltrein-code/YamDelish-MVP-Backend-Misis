import Image from 'next/image'

export default function ProfileAvatar() {
  return (
    <div className='h-[5.75rem] w-[5.75rem] self-center lg:self-start'>
      <Image
        src='/images/avatar.svg'
        alt='Аватар пользователя'
        width={92}
        height={92}
        className='rounded-full'
      />
    </div>
  )
}
