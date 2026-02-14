import { z } from "zod";

export const CreatePostDTO = z.object({
    title: z.string().min(1),
    content: z.any(),
    attachments: z.array(z.object({
        url: z.string().url(),
        type: z.enum(["image", "gif", "file"])
    })).optional(),
    description: z.string().min(50),
    status: z.enum(["draft", "published"]).optional(),
})

export type CreatePostDTO = z.infer<typeof CreatePostDTO>;

export const EditPostDTO = z.object({
    title: z.string().min(1).optional(),
    content: z.any().optional(),
    attachments: z.array(z.object({
        url: z.string().url(),
        type: z.enum(["image", "gif", "file"])
    })).optional(),
    description: z.string().min(50).optional(),
    status: z.enum(["draft", "published"]).optional(),
}).refine(
    data => data.title !== undefined || data.description !== undefined || data.content !== undefined || data.attachments !== undefined,
    {
        message: "At least one of title or description must be provided",
    }
);

export type EditPostDTO = z.infer<typeof EditPostDTO>;