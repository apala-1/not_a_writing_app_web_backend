import { IUser, UserModel } from "../model/user.model";

export interface IUserRepository {
    createUser(userData: Partial<IUser>): Promise<IUser>;
    getUserByEmail(email: string): Promise<IUser | null>
    getUserByUsername(username: string): Promise<IUser | null>
    // Additional
    getUserById(id: string): Promise<IUser | null>
    getAllUsers(): Promise<IUser[]>
    updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
    deleteUser(id: string): Promise<boolean>;
}

// Mongo Implementation of UserRepository
export class UserRepository implements IUserRepository {
    async getUserById(id: string): Promise<IUser | null> {
        // UserModel.findOne( {"_id": id} )
        const user = await UserModel.findById(id);
        return user;
    }
    async getAllUsers(): Promise<IUser[]> {
        const users = await UserModel.find();
        return users;
    }
    async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        // UserModel.updateOne( {"_id": id}, { $set: updateData } )
        const user = await UserModel.findByIdAndUpdate(id, updateData, { new: true });
        return user;
    }
    async deleteUser(id: string): Promise<boolean> {
        const result = await UserModel.findByIdAndDelete(id);
        return result ? true : false;
    }
    async createUser(userData: Partial<IUser>): Promise<IUser> {
        const user = new UserModel(userData);
        return await user.save();
    }
    async getUserByEmail(email: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ "email": email });
        return user;
    }
    async getUserByUsername(username: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ "username": username });
        return user;
    }
}