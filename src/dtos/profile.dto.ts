import z from "zod";

export const FollowDTO = z.object({
    targetUserId: z.string().min(24).max(24),
});

export const PostActionDTO = z.object({
    postId: z.string().min(24).max(24),
    action: z.enum(["like", "share", "save"]),
});