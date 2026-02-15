import mongoose, {Document, Schema } from "mongoose";

const postSchema: Schema = new Schema<IPost>(
    {
        title: { type: String, required: true, trim: true },
        content: Schema.Types.Mixed,
        description: { type: String, required: true, trim: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        attachments: [
            {
                url: { type: String, required: true },
                type: { type: String, enum: ["image", "gif", "file"], required: true }
            }
        ],
        status: { type: String, enum: ["draft", "published"], default: "published" },
    },
    { timestamps: true }
);

export interface IPost extends Document {
    title: string;
    content: any;
    description: string;
    author: mongoose.Types.ObjectId;
    attachments: {
        url: string;
        type: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
    status: string;
}

export const PostModel = mongoose.model<IPost>("Post", postSchema);