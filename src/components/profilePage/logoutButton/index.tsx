import { useRouter } from 'next/router'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { logOut } from '@/api/log-out'

export default function LogoutButton() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const logoutMutation = useMutation({
    mutationFn: logOut,
    onSuccess: async () => {
      queryClient.clear()
      await router.push('/login')
    },
  })

  return (
    <button
      type='button'
      disabled={logoutMutation.isPending}
      className='text-blue-500 hover:underline'
      onClick={() => logoutMutation.mutate()}
    >
      Выйти из аккаунта
    </button>
  )
}
