import { Router } from "express";
import multer from "multer";
import { container } from "tsyringe";
import { ImageController } from "../../../interfaces/controllers/image.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();
const imageController = container.resolve(ImageController);

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed"));
    }
  },
});

// POST /api/v1/images/upload - Upload a new image
router.post("/upload", requireAuth, upload.single("image"), imageController.uploadImage);

// GET /api/v1/images - Get all images for the tenant
router.get("/", requireAuth, imageController.getImages);

// DELETE /api/v1/images/:id - Delete an image
router.delete("/:id", requireAuth, imageController.deleteImage);

export { router as imagesRouter };

