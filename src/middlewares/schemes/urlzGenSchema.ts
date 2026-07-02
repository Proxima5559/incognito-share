import { z } from 'zod';

export const createUrlGenSchema = z.object({
  body: z.object({
    label: z.string().trim().max(50, 'Label is too long, bro.').optional(),
    
    message: z
        .string({
            error: 'Message content is required, bro.',
        })
        .min(1, {
            message: 'Message cannot be empty, bro.',
        }),
        
    maxViews: z
      .preprocess((val) => {
        if (val === '' || val === undefined || val === null) return null;
        return Number(val);
      }, z.number().int().min(1, 'Max views must be at least 1, bro.').nullable())
      .optional(),
  }),
});


export type CreateUrlGenInput = z.infer<typeof createUrlGenSchema>;