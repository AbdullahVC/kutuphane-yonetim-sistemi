import { z } from "zod";

export const purchaseStatusEnum = z.enum(["pending", "ordered", "bought", "dismissed"]);

export const toBuyBookSchema = z.object({
  title: z.string().min(1, "Başlık zorunludur"),
  authorId: z.string().optional().nullable(),
  genre: z.string().optional().nullable(),
  publisher: z.string().optional().nullable(),
  volumeCount: z.number().int().positive().optional().nullable(),
  note: z.string().optional().nullable(),
  status: purchaseStatusEnum.optional(),
});

export const toBuyBookUpdateSchema = toBuyBookSchema.partial().extend({
  title: z.string().min(1, "Başlık zorunludur").optional(),
  status: purchaseStatusEnum.optional(),
});

export type ToBuyBookInput = z.infer<typeof toBuyBookSchema>;
export type ToBuyBookUpdateInput = z.infer<typeof toBuyBookUpdateSchema>;

