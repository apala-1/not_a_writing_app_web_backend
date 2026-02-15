import { z } from "zod";

export const createCommentDTO = z.object({
  postId: z.string(),
  content: z.string().min(1, "Comment cannot be empty"),
});

export type CreateCommentDTO = z.infer<typeof createCommentDTO>;
