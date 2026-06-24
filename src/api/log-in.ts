export const logIn = async (data: { email: string; password: string }) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) throw new Error('Ошибка авторизации')
  return await res.json()
}
