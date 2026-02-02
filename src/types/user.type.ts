import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  profilePicture: z.string().optional().default("default-picture.png"),
  role: z.enum(["user", "admin"]).default("user"),
  bio: z.string().optional().default(""),
  occupation: z.string().optional().default(""),
  createdAt: z.date().optional().default(() => new Date()),
});

export type UserType = z.infer<typeof userSchema>;
