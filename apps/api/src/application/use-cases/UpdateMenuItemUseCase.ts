import { injectable, inject } from "tsyringe";
import type { IMenuRepository } from "../../domain/repositories/IMenuRepository.js";
import { Money } from "../../domain/value-objects/Money.js";
import { NotFoundError, ValidationError } from "../../shared/errors/domain-error.js";
import { createLogger } from "@inkwave/utils";

const logger = createLogger("update-menu-item-use-case");

export interface UpdateMenuItemInput {
  itemId: string;
  name?: string;
  description?: string;
  price?: number;
  imageUrls?: string[];
  isAvailable?: boolean;
}

export interface UpdateMenuItemOutput {
  item: {
    id: string;
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    imageUrls: string[];
    isAvailable: boolean;
    options: any[];
    createdAt: string;
    updatedAt: string;
  };
}

@injectable()
export class UpdateMenuItemUseCase {
  constructor(
    @inject("IMenuRepository") private menuRepository: IMenuRepository
  ) {}

  async execute(input: UpdateMenuItemInput): Promise<UpdateMenuItemOutput> {
    logger.info({ itemId: input.itemId }, "Updating menu item");

    // Find existing menu item
    const menuItem = await this.menuRepository.findById(input.itemId);
    if (!menuItem) {
      throw new NotFoundError("Menu item not found");
    }

    // Update menu item properties using entity methods
    if (input.name !== undefined) {
      menuItem.updateName(input.name);
    }

    if (input.description !== undefined) {
      menuItem.updateDescription(input.description);
    }

    if (input.price !== undefined) {
      if (input.price < 0) {
        throw new ValidationError("Menu item price must be non-negative");
      }
      menuItem.updatePrice(Money.fromAmount(input.price));
    }

    if (input.imageUrls !== undefined) {
      menuItem.updateImageUrls(input.imageUrls);
    }

    if (input.isAvailable !== undefined) {
      menuItem.setAvailability(input.isAvailable);
    }

    await this.menuRepository.save(menuItem);

    logger.info({ itemId: menuItem.id }, "Menu item updated successfully");

    return {
      item: menuItem.toJSON(),
    };
  }
}

