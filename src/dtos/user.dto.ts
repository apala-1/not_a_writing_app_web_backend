import { z } from "zod";
import { userSchema } from "../types/user.type";

export const CreateUserDTO = userSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  username: true,
  password: true,
}).extend({
  confirmPassword: z.string().min(6),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

export type CreateUserType = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginUserType = z.infer<typeof LoginUserDTO>;
