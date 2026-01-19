import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

let authController = new AuthController();
let router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
// add remaining routes like login, logout, etc

export default router;