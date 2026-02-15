import mongoose from "mongoose";
import { BookRepository } from "../repository/book.repository";
import { CreateBookDTO, EditBookDTO } from "../dtos/book.dto";
import { IBook } from "../model/book.model";

const bookRepository = new BookRepository();

export class BookService {
    async createBook(data: Partial<IBook>, userId: string): Promise<IBook> {
        const bookData: Partial<IBook> = {
            ...data,
            author: new mongoose.Types.ObjectId(userId),
        };

        return await bookRepository.createBook(bookData);
    }
    async getBookById(id: string, userId?: string): Promise<IBook> {
    const book = await bookRepository.getBookById(id);
    if (!book) throw new Error("Book not found");

    if (!userId) return book; // if not logged in, you could restrict or just show public only

    const mongoUserId = new mongoose.Types.ObjectId(userId);

    if (book.visibility === "public") {
        return book; // public, fine
    }

    if (book.visibility === "private") {
        const isAuthor = book.author.equals(mongoUserId);
        const isSharedWith = book.sharedWith?.some(id => id.equals(mongoUserId));
        if (!isAuthor && !isSharedWith) throw new Error("Unauthorized"); // 403
        return book;
    }

    if (book.visibility === "link") {
        // only author can access via /books/:id
        if (!book.author.equals(mongoUserId)) throw new Error("Unauthorized");
        return book;
    }

    return book;
}

    async getAllBooks(userId: string, skip = 0, limit = 10): Promise<IBook[]> {
    // public books
    const publicBooks = await bookRepository.find({ visibility: "public" }, skip, limit);

    // books authored by the user
    const ownBooks = await bookRepository.find({ author: new mongoose.Types.ObjectId(userId) }, skip, limit);

    // private books shared with the user
    const sharedBooks = await bookRepository.find({ 
        visibility: "private", 
        sharedWith: new mongoose.Types.ObjectId(userId) 
    }, skip, limit);

    // combine and remove duplicates
    const allBooks = [...ownBooks, ...publicBooks, ...sharedBooks];
    return Array.from(new Set(allBooks));
}

    
    async updateBook(
        id: string,
        data: Partial<EditBookDTO>,
        userId: string
    ): Promise<IBook> {
        const book = await bookRepository.getBookById(id);
        if (!book) throw new Error("Book not found");
        if (book.author.toString() !== userId) throw new Error("Unauthorized");

        // Separate sharedWith from the rest
        const { sharedWith, ...rest } = data;

        // Convert sharedWith to ObjectId[]
        const dbData: Partial<IBook> = {
            ...rest,
            ...(sharedWith ? { sharedWith: sharedWith.map(id => new mongoose.Types.ObjectId(id)) } : {})
        };

        const updated = await bookRepository.updateBook(id, dbData);
        if (!updated) throw new Error("Failed to update book");
        return updated;
    }

    async deleteBook(id: string, userId: string): Promise<void> {
        const book = await bookRepository.getBookById(id);
        if (!book) throw new Error("Book not found");
        if (book.author.toString() !== userId) throw new Error("Unauthorized");
        const deleted = await bookRepository.deleteBook(id);
        if (!deleted) throw new Error("Failed to delete book");
    }
    async getDrafts(userId: string): Promise<IBook[]> {
        return await bookRepository.getDrafts(userId);
    }
    async getBookByShareToken(token: string): Promise<IBook> {
    const book = await bookRepository.getBookByShareToken(token);
    if (!book || book.visibility !== "link") throw new Error("Book not found");
    return book;
}
}