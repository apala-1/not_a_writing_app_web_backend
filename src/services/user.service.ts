import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repository/user.repository";
import { IUser } from "../model/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { HttpError } from "../errors/http-error";
import { ProfileService } from "./profile.service";

const userRepository = new UserRepository();
const profileService = new ProfileService();

export class UserService {
  async createUser(data: CreateUserDTO): Promise<IUser> {
    const existing = await userRepository.getUserByEmail(data.email);
    if (existing) throw new HttpError("Email already in use", 403);

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const userData: Partial<IUser> = {
      ...data,
      password: hashedPassword,
    };

    const user = await userRepository.createUser(userData);

    await profileService.createProfile(user._id.toString());

    return user;
  }

  async loginUser(data: LoginUserDTO): Promise<{ token: string; user: IUser }> {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) throw new HttpError("Invalid Credentials", 401);

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) throw new HttpError("Invalid Credentials", 401);

    const payload = { id: user._id.toString(), email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

    return { token, user };
  }
}
