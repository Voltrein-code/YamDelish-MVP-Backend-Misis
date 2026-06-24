export const sendRegistration = async (data: {
  name: string
  surname: string
  email: string
  password: string
  phone?: string
  address?: string
}) => {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) throw new Error('Ошибка регистрации')
  return await res.json()
}
