import { inject, injectable } from "tsyringe";
import type { Logger } from "@inkwave/utils";
import type { IImageLibraryRepository, ImageLibraryItem } from "../../domain/repositories/IImageLibraryRepository.js";

interface GetImagesInput {
  tenantId: string;
}

@injectable()
export class GetImagesUseCase {
  constructor(
    @inject("IImageLibraryRepository") private imageRepo: IImageLibraryRepository,
    @inject("Logger") private logger: Logger
  ) {}

  async execute(input: GetImagesInput): Promise<ImageLibraryItem[]> {
    this.logger.info({ tenantId: input.tenantId }, "Fetching images for tenant");

    const images = await this.imageRepo.findByTenantId(input.tenantId);

    this.logger.info(
      { tenantId: input.tenantId, count: images.length },
      "Images fetched successfully"
    );

    return images;
  }
}

