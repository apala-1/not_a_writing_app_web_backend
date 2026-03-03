import mongoose, { Types } from "mongoose";
import { BookRepository } from "../repository/book.repository";
import { CreateBookDTO, EditBookDTO } from "../dtos/book.dto";
import { BookModel, IBook } from "../model/book.model";

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

async getMyBooks(userId: string) {
    // Optional: track favorites or something similar if you have that
    const books = await BookModel.find({ author: userId })
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .lean();

    return books;
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
    console.log("updateBook called with:", { id, data, userId });

    try {
      // 1. Fetch the book
      const book = await bookRepository.getBookById(id);
      if (!book) throw new Error("Book not found");
      const mongoUserId = new mongoose.Types.ObjectId(userId);

if (!book.author || !book.author.equals(mongoUserId)) {
    throw new Error("Unauthorized");
}

      // 2. Separate sharedWith from the rest
      const { sharedWith, ...rest } = data;

      // 3. Clean chapters
      const cleanedChapters = (rest.chapters || []).map((chapter: any) => ({
        title: chapter.title || "Untitled Chapter",
        content: (chapter.content || []).map((item: any) => ({
          type: item.type === "text" || item.type === "image" ? item.type : "text",
          value: item.value || "",
        })),
      }));

      // 4. Prepare dbData safely
      const dbData: Partial<IBook> = {
        ...rest,
        ...(sharedWith
          ? { sharedWith: sharedWith.map((id) => new mongoose.Types.ObjectId(id)) }
          : {}),
        chapters: cleanedChapters,
      };

      // 5. Safe logging
      try {
        console.log("Final dbData for update:", JSON.stringify(dbData, null, 2));
      } catch {
        console.log("Final dbData for update (raw object):", dbData);
      }

      if (!dbData.chapters || !Array.isArray(dbData.chapters) || dbData.chapters.length === 0) {
        throw new Error("No chapters to update");
      }

      console.log("Sample chapter:", JSON.stringify(dbData.chapters[0] || {}, null, 2));

      // 6. Update in repository
      const updated = await bookRepository.updateBook(id, dbData);
      if (!updated) throw new Error("Failed to update book");

      return updated;
    } catch (err: any) {
      // Add more info to error for easier debugging
      console.error("Error in updateBook:", err.message, err.stack);
      throw new Error(err.message || "Unexpected error while updating book");
    }
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