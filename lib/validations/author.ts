import { z } from "zod";

export const authorSchema = z.object({
  name: z.string().min(1, "İsim zorunludur"),
  nickname: z.string().optional().nullable(),
  origin: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  deathDate: z.string().optional().nullable(),
  birthPlace: z.string().optional().nullable(),
  deathPlace: z.string().optional().nullable(),
  officialDuties: z.string().optional().nullable(),
  fiqhMadhhab: z.string().optional().nullable(),
  aqidahMadhhab: z.string().optional().nullable(),
  famousWorks: z.string().optional().nullable(),
  teachers: z.string().optional().nullable(),
  students: z.string().optional().nullable(),
  statusInTabakat: z.string().optional().nullable(),
  expertiseAreas: z.string().optional().nullable(),
  importantNotes: z.string().optional().nullable(),
});

export const authorUpdateSchema = authorSchema.partial().extend({
  name: z.string().min(1, "İsim zorunludur").optional(),
});

export type AuthorInput = z.infer<typeof authorSchema>;
export type AuthorUpdateInput = z.infer<typeof authorUpdateSchema>;

