import { Router } from "express";
import { AdminController } from "../../controllers/admin/user.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../../middlewares/authorized.middleware";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    // Keep original extension
    const ext = path.extname(file.originalname); // e.g., ".png"
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});


const router = Router();
const adminController = new AdminController();
const upload = multer({ storage });

// Protect admin routes
router.use(authorizedMiddleware, adminOnlyMiddleware);

router.post("/", upload.single("profilePicture"), adminController.createUser.bind(adminController));

router.get("/", adminController.getAllUsers.bind(adminController));
router.get("/:id", adminController.getUserById.bind(adminController));
router.put("/:id", upload.single("profilePicture"), adminController.updateUser.bind(adminController));
router.delete("/:id", adminController.deleteUser.bind(adminController));

export default router;
