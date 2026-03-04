import mongoose, { Types } from "mongoose";
import { UserType } from "./user.type";
import { IUser } from "../model/user.model";

export interface IComment {
  _id?: Types.ObjectId;
  post: Types.ObjectId;
  user: Types.ObjectId | IUser;
  content: string;
  parentComment?: Types.ObjectId | null;
  replies?: IComment[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type PopulatedCommentType = {
  user: UserType & { _id: mongoose.Types.ObjectId };
  _id?: Types.ObjectId;
  post: Types.ObjectId;
  content: string;
  parentComment?: Types.ObjectId | null;
  replies?: PopulatedCommentType[];
  createdAt?: Date;
  updatedAt?: Date;
}
