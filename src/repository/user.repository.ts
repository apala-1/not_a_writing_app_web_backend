import { UserModel, IUser } from "../model/user.model";

export interface IUserRepository {
    createUser(userData: Partial<IUser>): Promise<IUser>;
}

export class UserRepository implements IUserRepository {
    async createUser(userData: Partial<IUser>): Promise<IUser> {
        const user = new UserModel(userData);
        return await user.save();
    }
}