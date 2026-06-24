import LogoutButton from '@/components/profilePage/logoutButton'
import ProfileAvatar from '@/components/profilePage/profileAvatar'
import ProfileForm from '@/components/profilePage/profileForm'
import Header from '@/components/ui/headers/header'
import HeaderMobile from '@/components/ui/headers/headerMobile'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[url('/images/bgImageM.jpg')] bg-cover bg-fixed bg-center lg:bg-gray-100 lg:bg-none">
      <HeaderMobile />
      <Header />
      <div className='flex flex-col items-center gap-8 p-5 lg:gap-4 lg:py-8'>
        <div className='hidden lg:flex lg:w-[36.25rem] lg:flex-col lg:items-start lg:gap-2'>
          <h2 className='text-3xl font-bold text-gray-800'>Настройка аккаунта</h2>
        </div>
        <div className='w-full rounded-xl border border-gray-300 bg-white px-4 py-6 shadow-lg lg:max-w-[36.25rem] lg:px-6 lg:py-9'>
          <div className='flex flex-col gap-4 lg:gap-3'>
            <ProfileAvatar />
            <ProfileForm />
          </div>
          <div className='mt-8 text-sm'>
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  )
}
