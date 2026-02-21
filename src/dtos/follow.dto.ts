import { z } from "zod";

export const FollowDTO = z.object({
    targetUserId: z.string().min(24).max(24),
});

export type FollowDTO = z.infer<typeof FollowDTO>;