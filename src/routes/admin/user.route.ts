import { Router } from "express";
import multer from "multer";
import { AdminController } from "../../controllers/admin/user.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();
const adminController = new AdminController();
const upload = multer({ dest: "uploads/" });

// Protect admin routes
router.use(authorizedMiddleware, adminOnlyMiddleware);

router.get("/", adminController.getAllUsers.bind(adminController));
router.get("/:id", adminController.getUserById.bind(adminController));
router.put("/:id", upload.single("profilePicture"), adminController.updateUser.bind(adminController));
router.delete("/:id", adminController.deleteUser.bind(adminController));

export default router;
