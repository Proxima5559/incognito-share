import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters long.')
      .max(30, 'Username cannot exceed 30 characters.')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores.'
      ),

    email: z
      .string()
      .trim()
      .email({ error: 'Please provide a valid email address.' })
      .max(255, 'Email cannot exceed 255 characters.'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long.')
      .max(128, 'Password cannot exceed 128 characters.')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
      .regex(/[0-9]/, 'Password must contain at least one number.')
      .regex(
        /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
        'Password must contain at least one special character.'
      ),

    confirmPassword: z.string(),
  }),
})
.superRefine(({ body }, ctx) => {
  if (body.password !== body.confirmPassword) {
    ctx.addIssue({
      code: 'custom',
      path: ['body', 'confirmPassword'],
      message: 'Passwords do not match.',
    });
  }
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email({ error: 'Please provide a valid email address.' }),

    password: z
      .string()
      .min(1, 'Password is required.'),
  }),
});