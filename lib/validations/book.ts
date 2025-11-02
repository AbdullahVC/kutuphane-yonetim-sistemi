import { z } from "zod";

export const bookSchema = z.object({
  title: z.string().min(1, "Başlık zorunludur"),
  authorId: z.string().optional().nullable(),
  genre: z.string().optional().nullable(),
  publisher: z.string().optional().nullable(),
  volumeCount: z.number().int().positive().optional().nullable(),
  library: z.string().optional().nullable(),
  shelf: z.string().optional().nullable(),
  number: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

export const bookUpdateSchema = bookSchema.partial().extend({
  title: z.string().min(1, "Başlık zorunludur").optional(),
});

export type BookInput = z.infer<typeof bookSchema>;
export type BookUpdateInput = z.infer<typeof bookUpdateSchema>;

