import mongoose from "mongoose";
import { BookRepository } from "../repository/book.repository";
import { CreateBookDTO } from "../dtos/book.dto";
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
    async getBookById(id: string): Promise<IBook> {
        const book = await bookRepository.getBookById(id);
        if (!book) throw new Error("Book not found");
        return book;
    }
    async getAllBooks(skip: number = 0, limit: number = 10): Promise<IBook[]> {
        return await bookRepository.getAllBooks(skip, limit);
    }
    async updateBook(id: string, data: Partial<CreateBookDTO>, userId: string): Promise<IBook> {
        const book = await bookRepository.getBookById(id);
        if (!book) throw new Error("Book not found");
        if (book.author.toString() !== userId) throw new Error("Unauthorized");
        const updated = await bookRepository.updateBook(id, data);
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
}