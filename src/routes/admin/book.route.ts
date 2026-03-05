// routes/admin/book.routes.ts
import { Router } from "express";
import { AdminBookController } from "../../controllers/admin/book.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../../middlewares/authorized.middleware";
import { uploadBook } from "../../config/multer";

const router = Router();
const controller = new AdminBookController();

// Protect all admin book routes
router.use(authorizedMiddleware, adminOnlyMiddleware);

router.get("/", controller.getAllBooks.bind(controller));
router.get("/:id", controller.getBook.bind(controller));
router.post("/", uploadBook.single("coverPhoto"), controller.createBook.bind(controller));
router.put("/:id", uploadBook.single("coverPhoto"), controller.updateBook.bind(controller));
router.delete("/:id", controller.deleteBook.bind(controller));

export default router;