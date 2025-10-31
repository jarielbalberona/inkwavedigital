import { injectable, inject } from "tsyringe";
import type { IMenuRepository } from "../../domain/repositories/IMenuRepository.js";
import type { IVenueRepository } from "../../domain/repositories/IVenueRepository.js";
import { NotFoundError } from "../../shared/errors/domain-error.js";
import { createLogger } from "@inkwave/utils";

const logger = createLogger("get-categories-use-case");

export interface GetCategoriesInput {
  venueId: string;
}

export interface GetCategoriesOutput {
  categories: Array<{
    id: string;
    menuId: string;
    name: string;
    sortIndex: number;
    iconUrl: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
}

@injectable()
export class GetCategoriesUseCase {
  constructor(
    @inject("IMenuRepository") private menuRepository: IMenuRepository,
    @inject("IVenueRepository") private venueRepository: IVenueRepository
  ) {}

  async execute(input: GetCategoriesInput): Promise<GetCategoriesOutput> {
    logger.info({ venueId: input.venueId }, "Fetching categories for venue");

    // Validate venue exists
    const venue = await this.venueRepository.findById(input.venueId);
    if (!venue) {
      throw new NotFoundError("Venue");
    }

    // Get categories for this venue
    const categories = await this.menuRepository.findCategoriesByVenueId(input.venueId);

    logger.info({ venueId: input.venueId, categoryCount: categories.length }, "Categories fetched successfully");

    return {
      categories: categories.map((category) => ({
        id: category.id,
        menuId: category.menuId,
        name: category.name,
        sortIndex: category.sortIndex,
        iconUrl: category.iconUrl ?? null,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      })),
    };
  }
}
