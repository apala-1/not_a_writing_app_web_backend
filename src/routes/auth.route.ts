import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/authorized.middleware";

let authController = new AuthController();
let router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

router.use(authMiddleware);

export default router;