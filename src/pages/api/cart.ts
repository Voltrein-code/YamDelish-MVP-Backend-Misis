import type { NextApiRequest, NextApiResponse } from 'next'

import {
  addDishToCart,
  getUserCart,
  removeCartItem,
  updateCartItemQuantity,
} from '@/services/delivery'
import { requireRequestUserId } from '@/utils/apiAuth'
import {
  cartAddRequestSchema,
  cartUpdateRequestSchema,
  getValidationMessage,
} from '@/utils/apiSchemas'
import { sendHttpError } from '@/utils/httpError'

const getStringParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = requireRequestUserId(req, res)

  if (!userId) return

  try {
    if (req.method === 'GET') {
      const cart = await getUserCart(userId)
      return res.status(200).json(cart)
    }

    if (req.method === 'POST') {
      const parsedBody = cartAddRequestSchema.safeParse(req.body)

      if (!parsedBody.success) {
        return res.status(400).json({ message: getValidationMessage(parsedBody.error) })
      }

      const { dishId, quantity } = parsedBody.data

      const cart = await addDishToCart(dishId, userId, quantity)
      return res.status(200).json(cart)
    }

    if (req.method === 'PATCH') {
      const parsedBody = cartUpdateRequestSchema.safeParse(req.body)

      if (!parsedBody.success) {
        return res.status(400).json({ message: getValidationMessage(parsedBody.error) })
      }

      const { cartItemId, quantity } = parsedBody.data

      const cart = await updateCartItemQuantity(cartItemId, userId, quantity)
      return res.status(200).json(cart)
    }

    if (req.method === 'DELETE') {
      const cartItemId = getStringParam(req.query.cartItemId)

      if (!cartItemId) {
        return res.status(400).json({ message: 'cartItemId обязателен' })
      }

      const cart = await removeCartItem(cartItemId, userId)
      return res.status(200).json(cart)
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
    return res.status(405).json({ message: 'Метод не поддерживается' })
  } catch (error) {
    return sendHttpError(res, error, 'Не удалось обработать корзину')
  }
}
