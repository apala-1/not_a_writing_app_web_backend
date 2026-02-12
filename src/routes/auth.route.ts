import { Router } from "express";
import multer from "multer";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const authController = new AuthController();
const upload = multer({ dest: "uploads/" });

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

router.get("/me", authorizedMiddleware, authController.getMe);
router.put("/me", authorizedMiddleware, upload.single("profilePicture"), authController.updateMe);
router.delete("/me", authorizedMiddleware, authController.deleteMe);

export default router;
