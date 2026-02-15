import { z } from "zod";

export const bookSchema = z.object({
    coverPhoto: z.enum(['image', 'file']),
    coverPhotoUrl: z.string(),
    title: z.string().min(1),
    description: z.string().min(50).max(1000, "Description cannot exceed 1000 characters"),
    noOfChapters: z.number().int().positive(),
    noOfPages: z.number().int().positive(),
    chapters: z.array(z.object({
        title: z.string().min(1),
        content: z.any(),
    }).optional()),
    status: z.enum(["draft", "published"]).default("published"),
    createdAt: z.date().optional().default(() => new Date()),
});