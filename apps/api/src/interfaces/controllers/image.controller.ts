import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type { Logger } from "@inkwave/utils";
import { UploadImageUseCase } from "../../application/use-cases/UploadImageUseCase.js";
import { GetImagesUseCase } from "../../application/use-cases/GetImagesUseCase.js";
import { DeleteImageUseCase } from "../../application/use-cases/DeleteImageUseCase.js";

@injectable()
export class ImageController {
  constructor(
    @inject("Logger") private logger: Logger,
    @inject(UploadImageUseCase) private uploadImageUseCase: UploadImageUseCase,
    @inject(GetImagesUseCase) private getImagesUseCase: GetImagesUseCase,
    @inject(DeleteImageUseCase) private deleteImageUseCase: DeleteImageUseCase
  ) {}

  uploadImage = async (req: Request, res: Response): Promise<void> => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, error: "No file uploaded" });
        return;
      }

      const tenantId = req.tenantId;
      const uploadedBy = req.auth?.userId;

      if (!tenantId || !uploadedBy) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }

      const result = await this.uploadImageUseCase.execute({
        file: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        tenantId,
        uploadedBy,
      });

      res.json({ success: true, data: result });
    } catch (error) {
      this.logger.error({ error }, "Error uploading image");
      res.status(500).json({ success: false, error: "Failed to upload image" });
    }
  };

  getImages = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = req.tenantId;

      if (!tenantId) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }

      const images = await this.getImagesUseCase.execute({ tenantId });
      res.json({ success: true, data: images });
    } catch (error) {
      this.logger.error({ error }, "Error fetching images");
      res.status(500).json({ success: false, error: "Failed to fetch images" });
    }
  };

  deleteImage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;

      if (!tenantId) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }

      await this.deleteImageUseCase.execute({ imageId: id, tenantId });
      res.json({ success: true });
    } catch (error) {
      this.logger.error({ error }, "Error deleting image");
      
      if (error instanceof Error && error.message === "Image not found") {
        res.status(404).json({ success: false, error: "Image not found" });
        return;
      }

      res.status(500).json({ success: false, error: "Failed to delete image" });
    }
  };
}

