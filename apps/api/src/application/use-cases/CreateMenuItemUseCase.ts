import { injectable, inject } from "tsyringe";
import type { IMenuRepository } from "../../domain/repositories/IMenuRepository.js";
import { MenuItem } from "../../domain/entities/MenuItem.js";
import { Money } from "../../domain/value-objects/Money.js";
import { NotFoundError, ValidationError } from "../../shared/errors/domain-error.js";
import { createLogger } from "@inkwave/utils";

const logger = createLogger("create-menu-item-use-case");

export interface CreateMenuItemInput {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrls?: string[];
  isAvailable?: boolean;
}

export interface CreateMenuItemOutput {
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
export class CreateMenuItemUseCase {
  constructor(
    @inject("IMenuRepository") private menuRepository: IMenuRepository
  ) {}

  async execute(input: CreateMenuItemInput): Promise<CreateMenuItemOutput> {
    logger.info({ categoryId: input.categoryId, name: input.name }, "Creating menu item");

    // Validate input
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError("Menu item name is required");
    }

    if (input.price < 0) {
      throw new ValidationError("Menu item price must be non-negative");
    }

    // Validate imageUrls count
    const imageUrls = input.imageUrls || [];
    if (imageUrls.length > 10) {
      throw new ValidationError("Maximum 10 images allowed per menu item");
    }

    // Create menu item
    const menuItem = MenuItem.create({
      categoryId: input.categoryId,
      name: input.name.trim(),
      description: input.description,
      price: Money.fromAmount(input.price),
      imageUrls: imageUrls,
      isAvailable: input.isAvailable ?? true,
      options: [],
    });

    await this.menuRepository.save(menuItem);

    logger.info({ itemId: menuItem.id, categoryId: input.categoryId }, "Menu item created successfully");

    return {
      item: menuItem.toJSON(),
    };
  }
}
