export const restorePass = async (email: string) => {
  const res = await fetch('/api/password/restore', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })

  if (!res.ok) throw new Error('Ошибка восстановления пароля')
  return await res.json()
}
