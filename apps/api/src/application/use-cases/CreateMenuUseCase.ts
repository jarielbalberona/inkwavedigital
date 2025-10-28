import { injectable, inject } from "tsyringe";
import type { IMenuRepository } from "../../domain/repositories/IMenuRepository.js";
import type { IVenueRepository } from "../../domain/repositories/IVenueRepository.js";
import { Menu } from "../../domain/entities/Menu.js";
import { NotFoundError, ValidationError } from "../../shared/errors/domain-error.js";
import { createLogger } from "@inkwave/utils";

const logger = createLogger("create-menu-use-case");

export interface CreateMenuInput {
  venueId: string;
  name: string;
  setAsActive?: boolean;
}

export interface CreateMenuOutput {
  menu: {
    id: string;
    venueId: string;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

@injectable()
export class CreateMenuUseCase {
  constructor(
    @inject("IMenuRepository") private menuRepository: IMenuRepository,
    @inject("IVenueRepository") private venueRepository: IVenueRepository
  ) {}

  async execute(input: CreateMenuInput): Promise<CreateMenuOutput> {
    logger.info({ venueId: input.venueId, name: input.name }, "Creating menu");

    // Validate venue exists
    const venue = await this.venueRepository.findById(input.venueId);
    if (!venue) {
      throw new NotFoundError("Venue");
    }

    // Check if setting as active
    const setAsActive = input.setAsActive ?? false;

    // If setting as active, check for existing active menu
    if (setAsActive) {
      const existingActiveMenu = await this.menuRepository.findActiveMenuByVenueId(input.venueId);
      if (existingActiveMenu) {
        logger.info(
          { venueId: input.venueId, existingMenuId: existingActiveMenu.id },
          "Deactivating existing active menu"
        );
      }
    }

    // Create menu
    const menu = Menu.create({
      venueId: input.venueId,
      name: input.name.trim(),
      isActive: setAsActive,
    });

    await this.menuRepository.saveMenu(menu);

    // If setting as active, ensure no other menus are active
    if (setAsActive) {
      await this.menuRepository.setActiveMenu(menu.id, input.venueId);
    }

    logger.info({ menuId: menu.id, venueId: input.venueId }, "Menu created successfully");

    return {
      menu: menu.toJSON(),
    };
  }
}

