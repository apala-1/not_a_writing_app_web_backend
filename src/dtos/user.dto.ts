import { z } from "zod";
import { userSchema } from "../types/user.type";

// Create user DTO for validation
export const CreateUserDTO = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters"),
  profilePicture: z.string().url().optional(),
  role: z.enum(["user", "admin"]).optional(),
  bio: z.string().optional(),
  occupation: z.string().optional(),
})

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

// Login DTO
export const LoginUserDTO = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;
