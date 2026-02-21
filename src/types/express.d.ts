// src/types/express.d.ts
import { IUser } from "../model/user.model"; // or just { _id: string } if you only need ID

declare global {
  namespace Express {
    interface Request {
      user?: { _id: string }; // or IUser if you have full user type
    }
  }
}