import { injectable, inject } from "tsyringe";
import type { IMenuRepository } from "../../domain/repositories/IMenuRepository.js";
import type { IVenueRepository } from "../../domain/repositories/IVenueRepository.js";
import { MenuCategory } from "../../domain/entities/MenuCategory.js";
import { NotFoundError, ValidationError } from "../../shared/errors/domain-error.js";
import { createLogger } from "@inkwave/utils";

const logger = createLogger("create-category-use-case");

export interface CreateCategoryInput {
  venueId: string;
  name: string;
  sortIndex?: number;
  iconUrl?: string;
}

export interface CreateCategoryOutput {
  category: {
    id: string;
    menuId: string;
    name: string;
    sortIndex: number;
    iconUrl?: string;
    createdAt: string;
    updatedAt: string;
  };
}

@injectable()
export class CreateCategoryUseCase {
  constructor(
    @inject("IMenuRepository") private menuRepository: IMenuRepository,
    @inject("IVenueRepository") private venueRepository: IVenueRepository
  ) {}

  async execute(input: CreateCategoryInput): Promise<CreateCategoryOutput> {
    logger.info({ venueId: input.venueId, name: input.name }, "Creating category");

    // Validate venue exists
    const venue = await this.venueRepository.findById(input.venueId);
    if (!venue) {
      throw new NotFoundError("Venue");
    }

    // Get the active menu for this venue
    const activeMenu = await this.menuRepository.findActiveMenuByVenueId(input.venueId);
    
    if (!activeMenu) {
      throw new ValidationError("No active menu found for venue. Please create a menu first.");
    }

    // Create category for the active menu
    const category = MenuCategory.create({
      menuId: activeMenu.id,
      name: input.name.trim(),
      sortIndex: input.sortIndex ?? 0,
      iconUrl: input.iconUrl,
    });

    await this.menuRepository.saveCategory(category);

    logger.info({ categoryId: category.id, venueId: input.venueId, menuId: activeMenu.id }, "Category created successfully");

    return {
      category: category.toJSON(),
    };
  }
}
