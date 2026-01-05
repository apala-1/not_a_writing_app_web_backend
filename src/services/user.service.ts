import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { CreateUserType, LoginUserType } from "../dtos/user.dto";

// In-memory store (replace later with Mongo)
type StoredUser = {
  id: number;
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  passwordHash: string;
  role?: "user" | "admin";
};
const users: StoredUser[] = [];

export class UserService {
  async createUser(data: CreateUserType) {
    // Check existing
    const exists = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) throw new Error("Email already in use");

    // Hash
    const passwordHash = await bcrypt.hash(data.password, 10);

    const newUser: StoredUser = {
      id: users.length + 1,
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      email: data.email,
      passwordHash,
      role: "user",
    };

    users.push(newUser);

    // Return safe view
    return {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
    };
  }

  async loginUser(data: LoginUserType) {
    const user = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (!user) throw new Error("User not found");

    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) throw new Error("Invalid credentials");

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "1h" }
    );

    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    return { token, user: safeUser };
  }
}
