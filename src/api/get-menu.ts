export const getMenu = async (id: string) => {
  const params = new URLSearchParams({ restaurantId: id })
  const res = await fetch(`/api/menu?${params.toString()}`)
  if (!res.ok) throw new Error('Ошибка загрузки меню')
  return await res.json()
}
