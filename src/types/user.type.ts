import { z } from "zod";

export const userSchema = z.object({
  email: z.string().email().min(5),
  password: z.string().min(8),
  username: z.string().min(3).max(30),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["user", "admin"]).default("user"),
});

export type UserType = z.infer<typeof userSchema>;
