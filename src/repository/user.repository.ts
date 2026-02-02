import { IUser, UserModel } from "../model/user.model";

export interface IUserRepository {
  createUser(userData: Partial<IUser>): Promise<IUser>;
  getUserByEmail(email: string): Promise<IUser | null>;
  getUserByUsername(username: string): Promise<IUser | null>;
  getUserById(id: string): Promise<IUser | null>;
  getAllUsers(): Promise<IUser[]>;
  updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
  deleteUser(id: string): Promise<boolean>;
  getUsersPaginated(skip: number, limit: number): Promise<IUser[]>;
  countUsers(): Promise<number>;
}

export class UserRepository implements IUserRepository {
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData);
    return await user.save();
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email }).exec();
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    return await UserModel.findOne({ username }).exec();
  }

  async getUserById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id).exec();
  }

  async getAllUsers(skip: number = 0, limit: number = 10): Promise<IUser[]> {
    return await UserModel.find().skip(skip).limit(limit).exec();
  }

  async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async getUsersPaginated(skip: number, limit: number): Promise<IUser[]> {
  return await UserModel.find().skip(skip).limit(limit).exec();
}

  async countUsers(): Promise<number> {
  return await UserModel.countDocuments().exec();
}

  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
