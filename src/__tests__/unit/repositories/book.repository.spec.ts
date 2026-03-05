import mongoose from "mongoose";
import { BookRepository } from "../../../repository/book.repository";
import { BookModel } from "../../../model/book.model";

jest.mock("../../../model/book.model"); // Mock BookModel

describe("BookRepository Unit Tests", () => {
  let repo: BookRepository;

  beforeEach(() => {
    repo = new BookRepository();
    jest.clearAllMocks();
  });

  describe("createBook", () => {
    it("should create and save a book", async () => {
      const bookData = { title: "Test Book" };
      const mockSave = jest.fn().mockResolvedValue(bookData);
      (BookModel as any).mockImplementation(() => ({ save: mockSave }));

      const result = await repo.createBook(bookData as any);

      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(bookData);
    });
  });

  describe("getBookById", () => {
    it("should return null if id is invalid", async () => {
      const result = await repo.getBookById("invalid-id");
      expect(result).toBeNull();
    });

    it("should return a book if id is valid", async () => {
      const book = { _id: "id1", title: "Book 1" };
      (BookModel.findById as jest.Mock).mockReturnValue({ populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(book) });

      const result = await repo.getBookById("507f1f77bcf86cd799439011");

      expect(BookModel.findById).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
      expect(result).toEqual(book);
    });
  });

  describe("getAllBooks", () => {
    it("should return books with skip and limit", async () => {
      const books = [{ _id: "1" }, { _id: "2" }];
      (BookModel.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(books),
      });

      const result = await repo.getAllBooks(0, 10);

      expect(result).toEqual(books);
    });
  });

  describe("updateBook", () => {
    it("should update a book", async () => {
      const updated = { _id: "id2", title: "Updated Book" };
      (BookModel.findByIdAndUpdate as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(updated) });

      const result = await repo.updateBook("id2", { title: "Updated Book" });

      expect(BookModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "id2",
        { title: "Updated Book" },
        { new: true, runValidators: true }
      );
      expect(result).toEqual(updated);
    });
  });

  describe("deleteBook", () => {
    it("should return true if deleted", async () => {
      (BookModel.findByIdAndDelete as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: "id3" }) });

      const result = await repo.deleteBook("id3");
      expect(result).toBe(true);
    });

    it("should return false if not found", async () => {
      (BookModel.findByIdAndDelete as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      const result = await repo.deleteBook("idNotExist");
      expect(result).toBe(false);
    });
  });

  describe("getDrafts", () => {
    it("should return drafts for user", async () => {
      const drafts = [{ _id: "d1", status: "draft" }];
      (BookModel.find as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(drafts) });

      const result = await repo.getDrafts("user1");
      expect(BookModel.find).toHaveBeenCalledWith({ author: "user1", status: "draft" });
      expect(result).toEqual(drafts);
    });
  });

  describe("getBookByShareToken", () => {
    it("should return book for a valid token", async () => {
      const book = { _id: "b1", shareToken: "abc123" };
      (BookModel.findOne as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(book) });

      const result = await repo.getBookByShareToken("abc123");
      expect(BookModel.findOne).toHaveBeenCalledWith({ shareToken: "abc123", visibility: "link" });
      expect(result).toEqual(book);
    });

    it("should return null if token not found", async () => {
      (BookModel.findOne as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      const result = await repo.getBookByShareToken("nonexistent");
      expect(result).toBeNull();
    });
  });
});