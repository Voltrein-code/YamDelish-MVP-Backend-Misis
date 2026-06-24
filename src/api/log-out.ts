export const logOut = async () => {
  const response = await fetch('/api/auth/logout', { method: 'POST' })
  if (!response.ok) throw new Error('Не удалось выйти из аккаунта')
}
