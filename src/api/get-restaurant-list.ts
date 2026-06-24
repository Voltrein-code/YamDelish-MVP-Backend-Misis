export const getRestaurantList = async () => {
  const res = await fetch('/api/restaurants')
  if (!res.ok) throw new Error('Ошибка загрузки ресторанов')
  return await res.json()
}
