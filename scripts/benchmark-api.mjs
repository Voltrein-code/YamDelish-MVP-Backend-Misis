import { performance } from 'node:perf_hooks'

const baseUrl = process.env.BENCHMARK_BASE_URL ?? 'http://localhost:3000'
const iterations = Number(process.env.BENCHMARK_ITERATIONS ?? 5)
const restaurantId = process.env.BENCHMARK_RESTAURANT_ID ?? '10000000-0000-4000-8000-000000000001'
const dishId = process.env.BENCHMARK_DISH_ID ?? '20000000-0000-4000-8000-000000000001'
let sessionCookie = process.env.BENCHMARK_SESSION_COOKIE

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(sessionCookie ? { Cookie: sessionCookie } : {}),
      ...options.headers,
    },
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) throw new Error(`${options.method ?? 'GET'} ${path}: HTTP ${response.status}`)
  return { body, response }
}

if (!sessionCookie) {
  const email = process.env.BENCHMARK_EMAIL
  const password = process.env.BENCHMARK_PASSWORD
  if (!email || !password) {
    throw new Error('Укажите BENCHMARK_SESSION_COOKIE или BENCHMARK_EMAIL и BENCHMARK_PASSWORD')
  }

  const login = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  sessionCookie = login.response.headers.get('set-cookie')?.split(';')[0]
}

const percentile = (values, value) => {
  const sorted = [...values].sort((left, right) => left - right)
  return sorted[Math.min(sorted.length - 1, Math.ceil(value * sorted.length) - 1)]
}

const results = []
const measure = async (name, operation) => {
  const samples = []
  let lastBody

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const startedAt = performance.now()
    lastBody = (await operation()).body
    samples.push(performance.now() - startedAt)
  }

  results.push({
    endpoint: name,
    iterations,
    averageMs: Number((samples.reduce((sum, value) => sum + value, 0) / samples.length).toFixed(2)),
    p50Ms: Number(percentile(samples, 0.5).toFixed(2)),
    p95Ms: Number(percentile(samples, 0.95).toFixed(2)),
    minMs: Number(Math.min(...samples).toFixed(2)),
    maxMs: Number(Math.max(...samples).toFixed(2)),
  })

  return lastBody
}

const clearCart = async () => {
  const cart = (await request('/api/cart')).body
  for (const item of cart.items) {
    await request(`/api/cart?cartItemId=${encodeURIComponent(item.id)}`, { method: 'DELETE' })
  }
}

await measure('restaurants', () => request('/api/restaurants'))
await measure('menu', () => request(`/api/menu?restaurantId=${encodeURIComponent(restaurantId)}`))

await clearCart()
await request('/api/cart', {
  method: 'POST',
  body: JSON.stringify({ dishId, quantity: 1 }),
})
await measure('cart', () => request('/api/cart'))

await clearCart()
let lastOrder
const createdOrderIds = []
await measure('order-create', async () => {
  await request('/api/cart', {
    method: 'POST',
    body: JSON.stringify({ dishId, quantity: 1 }),
  })
  const result = await request('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ address: '', paymentMethod: 'benchmark-card' }),
  })
  lastOrder = result.body
  createdOrderIds.push(lastOrder.id)
  return result
})

await measure('orders', () => request('/api/orders'))
await measure('order-details', () => request(`/api/orders/${lastOrder.id}`))

console.log(
  JSON.stringify(
    {
      measuredAt: new Date().toISOString(),
      environment: `local API, ${iterations} sequential requests per operation`,
      baseUrl,
      createdOrderIds,
      results,
    },
    null,
    2,
  ),
)
