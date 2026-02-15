import { z } from "zod";

export const CreateBookDTO = z.object({
    title: z.string().min(1),
    description: z.string().min(50).max(1000, "Description cannot exceed 1000 characters"),
    status: z.enum(["draft", "published"]).default("published"),
    // noOfChapters: z.number().int().positive(),
    // noOfPages: z.number().int().positive(),
    chapters: z.array(z.object({
        title: z.string().min(1),
        content: z.any(),
    })).optional(),
    visibility: z.enum(["public", "private", "link"]).default("private"),
    sharedWith: z.array(z.string()).optional(),
});

export type CreateBookDTO = z.infer<typeof CreateBookDTO>;

export const EditBookDTO = z.object({
    title: z.string().min(1).optional(),
    status: z.enum(["draft", "published"]).optional(),
    description: z.string().min(50).max(1000, "Description cannot exceed 1000 characters").optional(),
    // noOfChapters: z.number().int().positive().optional(),
    // noOfPages: z.number().int().positive().optional(),
    chapters: z.array(z.object({
        title: z.string().min(1),
        content: z.any(),
    })).optional(),
    visibility: z.enum(["public", "private", "link"]).optional(),
    sharedWith: z.array(z.string()).optional(),
}).refine(
    data => data.title !== undefined || data.description !== undefined || data.chapters !== undefined || data.status !== undefined,
    {
        message: "At least one field must be provided for update",
    }
);

export type EditBookDTO = z.infer<typeof EditBookDTO>;