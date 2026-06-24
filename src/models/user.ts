import { z } from 'zod'

export const userInfoSchema = z
  .object({
    name: z.string().min(2).max(30),
    surname: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .superRefine((value, ctx) => {
    if (value.password !== value.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Пароли должны совпадать',
        path: ['confirmPassword'],
      })
    }
  })

export type UserInfo = z.infer<typeof userInfoSchema>
