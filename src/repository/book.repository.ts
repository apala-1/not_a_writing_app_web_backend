import { IBook, BookModel } from "../model/book.model";
import { PostModel } from "../model/post.model";

export interface IBookRepository {
    createBook(bookData: Partial<IBook>): Promise<IBook>;
    getBookById(id: string): Promise<IBook | null>;
    getAllBooks(): Promise<IBook[]>;
    updateBook(id: string, updateData: Partial<IBook>): Promise<IBook | null>;
    deleteBook(id: string): Promise<boolean>;
}

export class BookRepository implements IBookRepository {
    async createBook(bookData: Partial<IBook>): Promise<IBook> {
        const book = new BookModel(bookData);
        return await book.save();
    }
    async getBookById(id: string): Promise<IBook | null> {
       return await BookModel.findById(id).exec();
    }
    async getAllBooks(skip: number = 0, limit: number = 10): Promise<IBook[]> {
        return await BookModel.find().skip(skip).limit(limit).exec();
    }
    async updateBook(id: string, updateData: Partial<IBook>): Promise<IBook | null> {
        return await BookModel.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).exec();
    }
    async deleteBook(id: string): Promise<boolean> {
        const result = await BookModel.findByIdAndDelete(id).exec();
        return result !== null;
    }
    async getDrafts(userId: string): Promise<IBook[]> {
        return await BookModel.find({ author: userId, status: "draft" }).exec();
    }
}