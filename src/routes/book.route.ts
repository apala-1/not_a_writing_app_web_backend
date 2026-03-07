import { Router } from "express";
import { BookController } from "../controllers/books/book.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { uploadBook, uploadBookChapterImage } from "../config/multer";

const bookController = new BookController();
const router = Router();

router.use(authorizedMiddleware);

router.post(
  "/upload-chapter-image",
  uploadBookChapterImage.single("image"),
  bookController.uploadChapterImage.bind(bookController)
);

router.get("/my-books", bookController.getMyBooks.bind(bookController)); // ← your new endpoint
router.get("/", bookController.getAllBooks.bind(bookController));
router.get("/drafts", bookController.getDrafts.bind(bookController));
router.get("/token/:shareToken", bookController.getBookByToken.bind(bookController));
router.get("/:id", bookController.getBook.bind(bookController));

router.post(
    "/",
    uploadBook.single("coverPhoto"),
    bookController.createBook.bind(bookController)
);

router.put(
    "/:id",
    uploadBook.single("coverPhoto"),
    bookController.updateBook.bind(bookController)
);

router.delete("/:id", bookController.deleteBook.bind(bookController));

export default router;
