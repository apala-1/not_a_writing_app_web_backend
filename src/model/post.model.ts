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
        likesCount: { type: Number, default: 0 },
        commentsCount: { type: Number, default: 0 },
        sharesCount: { type: Number, default: 0 },
        savesCount: { type: Number, default: 0 },
        viewsCount: { type: Number, default: 0 },
        visibility: { type: String, enum: ["public", "private"], default: "public" },
    },
    { timestamps: true }
);

postSchema.index({ author: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ status: 1 });
postSchema.index({ visibility: 1 });

postSchema.index({ likesCount: -1 });
postSchema.index({ commentsCount: -1 });

postSchema.index({
  author: 1,
  status: 1,
  visibility: 1,
  createdAt: -1
});

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
    viewsCount: number;
    likesCount: number;
    sharesCount: number;
    savesCount: number;
    commentsCount: number;
    visibility: string;
}

export const PostModel = mongoose.model<IPost>("Post", postSchema);