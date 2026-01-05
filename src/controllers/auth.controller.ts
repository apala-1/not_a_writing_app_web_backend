import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import z, { success } from "zod";

let userService = new UserService();

export class AuthController {

    async register(req: Request, res: Response) {
        try {
            // Validate request body
            const parsedData = CreateUserDTO.safeParse(req.body);
            if (!parsedData.success) {
               return res.status(400).json(
                { success: false, message: z.prettifyError(parsedData.error) }
               )
            }
            const userData: CreateUserDTO = parsedData.data;

            // Call service to create user
            const newUser = await userService.createUser(userData);
            return res.status(201).json(
                { success: true, message: "User Created",data: newUser }
            );
        } catch (error: any) { // exception handling
            return res.status(error.statusCode ?? 500
            ).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }
    async login(req: Request, res: Response) {
        try {
            // Validate request body
            const parsedData = LoginUserDTO.safeParse(req.body);
            if (!parsedData.success) {
               return res.status(400).json(
                { success: false, message: z.prettifyError(parsedData.error) }
               )
            }
            const loginData: LoginUserDTO = parsedData.data;
            const { token, user } = await userService.loginUser(loginData);
            return res.status(200).json(
                { success: true, message: "Login Successful", data: { user, token } }
            );
        } catch (error: Error | any) { // exception handling
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }
}