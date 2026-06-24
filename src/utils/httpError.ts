import type { NextApiResponse } from 'next'

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

export const sendHttpError = (res: NextApiResponse, error: unknown, fallbackMessage: string) => {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ message: error.message })
  }

  return res.status(500).json({ message: fallbackMessage })
}
