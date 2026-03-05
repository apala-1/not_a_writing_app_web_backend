// controllers/admin/book.controller.ts
import { Request, Response } from "express";
import { BookService } from "../../services/book.service";
import { BookModel } from "../../model/book.model";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

const bookService = new BookService();

export class AdminBookController {

  // GET /admin/books
  async getAllBooks(req: Request, res: Response) {
    try {
      const skip = parseInt(req.query.skip as string) || 0;
      const limit = parseInt(req.query.limit as string) || 10;

      const total = await BookModel.countDocuments();

      const books = await BookModel.find()
        .populate("author", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return res.status(200).json({ success: true, data: books, total });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /admin/books/:id
  async getBook(req: Request, res: Response) {
    try {
      const book = await BookModel.findById(req.params.id).populate("author", "name email");
      if (!book) return res.status(404).json({ success: false, message: "Book not found" });
      return res.status(200).json({ success: true, data: book });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // POST /admin/books
  async createBook(req: Request, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const book = await bookService.createBook({ ...req.body }, userId);
      return res.status(201).json({ success: true, data: book });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // PUT /admin/books/:id
  async updateBook(req: Request, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const updated = await bookService.updateBook(req.params.id, req.body, userId);
      return res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // DELETE /admin/books/:id
  async deleteBook(req: Request, res: Response) {
    try {
      const book = await BookModel.findById(req.params.id);
      if (!book) return res.status(404).json({ success: false, message: "Book not found" });

      // delete cover photo from disk
      if (book.coverPhotoUrl) {
        const filePath = path.join(process.cwd(), book.coverPhotoUrl.startsWith("/") ? book.coverPhotoUrl.slice(1) : book.coverPhotoUrl);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      await BookModel.findByIdAndDelete(req.params.id);
      return res.status(200).json({ success: true, message: "Book deleted by admin" });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}