import { z } from "zod";

export const postSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(50),
    createdAt: z.date().optional().default(() => new Date()),
});

export type PostType = z.infer<typeof postSchema>;