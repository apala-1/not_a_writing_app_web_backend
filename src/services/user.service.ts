import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { HttpError } from "../errors/http-error";
import bcryptjs from "bcryptjs";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../config/index";
import { UserRepository } from "../repository/user.repository";

let userRepository = new UserRepository();

export class UserService {

    async createUser(data: CreateUserDTO){
        // business logic before creating user
        const emailCheck = await userRepository.getUserByEmail(data.email);
        if(emailCheck){
            throw new HttpError("Email already in use", 403);
        }
        const usernameCheck = await userRepository.getUserByUsername(data.username);
        if(usernameCheck){
            throw new HttpError("Username already in use", 403);
        }
        // hash password
        const hashedPassword = await bcryptjs.hash(data.password, 10); // 10 complexity
        data.password = hashedPassword;

        // create user
        const newUser = await userRepository.createUser(data);
        return newUser;
    }

    async loginUser(data: LoginUserDTO){
        const user =  await userRepository.getUserByEmail(data.email);
        if(!user){
            throw new HttpError("Invalid Credentials", 401);
        }
        // compare password
        const isPasswordValid = await bcryptjs.compare(data.password, user.password);
        // plaintext, hashed
        if(!isPasswordValid){
            throw new HttpError("Invalid Credentials", 401);
        }
        // generate jwt
        const payload = { // user identifier
            id: user._id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        }
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
        return { token, user };
    }
}