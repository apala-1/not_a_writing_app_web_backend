import mongoose, { Document, Schema } from "mongoose";

const bookSchema: Schema = new Schema<IBook>(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        coverPhoto: { type: String, enum: ["image", "file"], required: true },
        coverPhotoUrl: { type: String, required: true },
        noOfChapters: { type: Number, required: true, default: 0 },
        noOfPages: { type: Number, required: true, default: 0 },
        chapters: [
            {
                title: { type: String, required: true, trim: true },
                content: Schema.Types.Mixed,
            }
        ],
        status: { type: String, enum: ["draft", "published"], default: "published" },
    },
    { timestamps: true }
);

export interface IBook extends Document {
    title: string;
    description: string;
    author: mongoose.Types.ObjectId;
    coverPhoto: 'image' | 'file';
    coverPhotoUrl: string;
    noOfChapters: number;
    noOfPages: number;
    chapters: {
        title: string;
        content: any;
    }[];
    createdAt: Date;
    updatedAt: Date;
    status: string;
}

export const BookModel = mongoose.model<IBook>("Book", bookSchema);