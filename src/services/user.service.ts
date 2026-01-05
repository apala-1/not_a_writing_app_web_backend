import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repository/user.repository";
import { HttpError } from "../errors/http-error";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";