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

    // Get the menu for this venue
    const venueMenus = await this.menuRepository.findCategoriesByVenueId(input.venueId);
    let menuId: string;

    if (venueMenus.length === 0) {
      // Get the menu ID directly from the database
      // This is a temporary solution - we need to add a method to get menu by venue
      const db = (this.menuRepository as any).db; // Access the database directly
      const menus = await db.query.menus.findMany({
        where: (m: any, { eq }: any) => eq(m.venueId, input.venueId),
      });
      
      if (menus.length === 0) {
        throw new ValidationError("No menu found for venue. Please create a menu first.");
      }
      menuId = menus[0].id;
    } else {
      menuId = venueMenus[0].menuId;
    }

    // Create category
    const category = MenuCategory.create({
      menuId,
      name: input.name.trim(),
      sortIndex: input.sortIndex ?? 0,
      iconUrl: input.iconUrl,
    });

    await this.menuRepository.saveCategory(category);

    logger.info({ categoryId: category.id, venueId: input.venueId }, "Category created successfully");

    return {
      category: category.toJSON(),
    };
  }
}
