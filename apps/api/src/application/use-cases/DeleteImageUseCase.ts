import { inject, injectable } from "tsyringe";
import type { Logger } from "@inkwave/utils";
import type { R2StorageService } from "../../infrastructure/storage/R2StorageService.js";
import type { IImageLibraryRepository } from "../../domain/repositories/IImageLibraryRepository.js";
import { NotFoundError } from "../../shared/errors/domain-error.js";

interface DeleteImageInput {
  imageId: string;
  tenantId: string;
}

@injectable()
export class DeleteImageUseCase {
  constructor(
    @inject("R2StorageService") private storage: R2StorageService,
    @inject("IImageLibraryRepository") private imageRepo: IImageLibraryRepository,
    @inject("Logger") private logger: Logger
  ) {}

  async execute(input: DeleteImageInput): Promise<void> {
    this.logger.info({ imageId: input.imageId, tenantId: input.tenantId }, "Deleting image");

    // Find the image
    const image = await this.imageRepo.findById(input.imageId);

    if (!image) {
      throw new NotFoundError("Image not found");
    }

    // Verify tenant ownership
    if (image.tenantId !== input.tenantId) {
      throw new NotFoundError("Image not found");
    }

    // Delete from R2
    await this.storage.deleteImage(image.filename, image.tenantId);

    // Delete from database
    await this.imageRepo.delete(input.imageId);

    this.logger.info({ imageId: input.imageId }, "Image deleted successfully");
  }
}

