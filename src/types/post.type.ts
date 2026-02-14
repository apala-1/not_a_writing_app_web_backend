import { z } from "zod";

export const postSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(50).max(1000, "Description cannot exceed 1000 characters"),
    content: z.any(),
    attachments: z.array(z.object({
        url: z.string().url(),
        type: z.enum(["image", "gif", "file"])
    })).optional(),
    status: z.enum(["draft", "published"]).default("published"),
    createdAt: z.date().optional().default(() => new Date()),
});

export type PostType = z.infer<typeof postSchema>;