import mongoose, {Document, mongo, Schema } from "mongoose";
import { required } from "zod/v4/core/util.cjs";

const postSchema: Schema = new Schema<IPost>(
    {
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true },
        description: { type: String, required: true, trim: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        attachments: [
            {
                url: { type: String, required: true },
                type: { type: String, enum: ["image", "gif", "file"], required: true }
            }
        ]
    },
    { timestamps: true }
);

export interface IPost extends Document {
    title: string;
    content: string;
    description: string;
    author: mongoose.Types.ObjectId;
    attachments: {
        url: string;
        type: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

export const PostModel = mongoose.model<IPost>("Post", postSchema);