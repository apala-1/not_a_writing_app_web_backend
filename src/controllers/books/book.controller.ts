import { Request, Response } from "express";
import { CreateBookDTO, EditBookDTO } from "../../dtos/book.dto";
import { BookService } from "../../services/book.service";
import z from "zod";
import path, { parse } from "path";
import fs from "fs";
import { IUser } from "../../model/user.model";
import crypto from "crypto";
import mongoose from "mongoose";

function toObjectIdArray(ids?: string[]): mongoose.Types.ObjectId[] | undefined {
    return ids?.map(id => new mongoose.Types.ObjectId(id));
}

const bookService = new BookService();

declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

export class BookController {

    async createBook(req: Request, res: Response) {
        try {
            const parsed = CreateBookDTO.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsed.error),
                });
            }

            let shareToken: string | undefined;
            if (parsed.data.visibility === "link") {
                shareToken = crypto.randomBytes(16).toString("hex");
            }

            const file = req.file as Express.Multer.File | undefined;

            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: "Cover photo is required",
                });
            }

            const book = await bookService.createBook(
                {
                    ...parsed.data,
                    coverPhoto: file.mimetype.startsWith("image") ? "image" : "file",
                    coverPhotoUrl: `/uploads/books/${file.filename}`,
                    shareToken,
                    sharedWith: toObjectIdArray(parsed.data.sharedWith), // <--- convert here
                },
                req.user!._id.toString()
            );

            return res.status(201).json({
                success: true,
                data: book,
            });

        } catch (err: any) {
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }

    async updateBook(req: Request, res: Response) {
        try {
            const parsed = EditBookDTO.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsed.error),
                });
            }

            let shareToken: string | undefined;
            if (parsed.data.visibility === "link") {
                shareToken = crypto.randomBytes(16).toString("hex");
            }

            const file = req.file as Express.Multer.File | undefined;

            if (file) {
                const oldBook = await bookService.getBookById(req.params.id);

                if (oldBook.coverPhotoUrl) {
                    const oldPath = path.join(process.cwd(), oldBook.coverPhotoUrl);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
            }

            const updateData = {
                ...parsed.data,
                ...(file && { 
                    coverPhoto: file.mimetype.startsWith("image") ? "image" : "file",
                    coverPhotoUrl: `/uploads/books/${file.filename}` 
                }),
                ...(parsed.data.visibility === "link" && { shareToken }),
            };

            const updated = await bookService.updateBook(
                req.params.id,
                updateData,
                req.user!._id.toString()
            );

            return res.status(200).json({
                success: true,
                data: updated,
            });

        } catch (err: any) {
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }

    async getBook(req: Request, res: Response) {
    try {
        const book = await bookService.getBookById(req.params.id, req.user?._id.toString());
        return res.status(200).json({ success: true, data: book });
    } catch (err: any) {
        if (err.message === "Unauthorized") {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        if (err.message === "Book not found") {
            return res.status(404).json({ success: false, message: "Book not found" });
        }
        return res.status(500).json({ success: false, message: err.message });
    }
}


    async getAllBooks(req: Request, res: Response) {
    try {
        const skip = parseInt(req.query.skip as string) || 0;
        const limit = parseInt(req.query.limit as string) || 10;

        const books = await bookService.getAllBooks(req.user!._id.toString(), skip, limit);

        return res.status(200).json({
            success: true,
            data: books,
        });

    } catch (err: any) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}

    async deleteBook(req: Request, res: Response) {
        try {
            const book = await bookService.getBookById(req.params.id);

            if (book.author.toString() !== req.user!._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            if (book.coverPhotoUrl) {
                const filePath = path.join(process.cwd(), book.coverPhotoUrl);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            await bookService.deleteBook(
                req.params.id,
                req.user!._id.toString()
            );

            return res.status(200).json({
                success: true,
                message: "Deleted",
            });

        } catch (err: any) {
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }

    async getDrafts(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const drafts = await bookService.getDrafts(req.user._id.toString());

            return res.status(200).json({
                success: true,
                data: drafts,
            });

        } catch (err: any) {
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }
    async getBookByToken(req: Request, res: Response) {
        console.log("Params:", req.params);
    try {
        const book = await bookService.getBookByShareToken(req.params.shareToken);

        if (!book || book.visibility !== "link") {
        return res.status(404).json({ success: false });
        }

        return res.status(200).json({
        success: true,
        data: book,
        });

    } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
    }
    }

}
