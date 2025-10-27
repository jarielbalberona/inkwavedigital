import { inject, injectable } from "tsyringe";
import type { Logger } from "@inkwave/utils";
import type { R2StorageService } from "../../infrastructure/storage/R2StorageService.js";
import type { IImageLibraryRepository, ImageLibraryItem } from "../../domain/repositories/IImageLibraryRepository.js";

interface UploadImageInput {
  file: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
  tenantId: string;
  uploadedBy: string;
}

@injectable()
export class UploadImageUseCase {
  constructor(
    @inject("R2StorageService") private storage: R2StorageService,
    @inject("IImageLibraryRepository") private imageRepo: IImageLibraryRepository,
    @inject("Logger") private logger: Logger
  ) {}

  async execute(input: UploadImageInput): Promise<ImageLibraryItem> {
    this.logger.info(
      { originalName: input.originalName, tenantId: input.tenantId },
      "Uploading image"
    );

    // Generate unique filename
    const ext = input.originalName.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    // Upload to R2
    const { url, thumbnailUrl, width, height } = await this.storage.uploadImage(
      input.file,
      filename,
      input.mimeType,
      input.tenantId
    );

    // Save to database
    const image = await this.imageRepo.save({
      tenantId: input.tenantId,
      filename,
      originalName: input.originalName,
      url,
      thumbnailUrl,
      size: input.size,
      mimeType: input.mimeType,
      width,
      height,
      uploadedBy: input.uploadedBy,
    });

    this.logger.info({ imageId: image.id }, "Image uploaded successfully");
    return image;
  }
}

