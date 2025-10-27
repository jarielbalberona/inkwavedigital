import { injectable, inject } from "tsyringe";
import type { IMenuRepository } from "../../domain/repositories/IMenuRepository.js";
import { NotFoundError } from "../../shared/errors/domain-error.js";
import { createLogger } from "@inkwave/utils";

const logger = createLogger("get-category-items-use-case");

export interface GetCategoryItemsInput {
  categoryId: string;
}

export interface GetCategoryItemsOutput {
  items: Array<{
    id: string;
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    isAvailable: boolean;
    options: any[];
    createdAt: string;
    updatedAt: string;
  }>;
}

@injectable()
export class GetCategoryItemsUseCase {
  constructor(
    @inject("IMenuRepository") private menuRepository: IMenuRepository
  ) {}

  async execute(input: GetCategoryItemsInput): Promise<GetCategoryItemsOutput> {
    logger.info({ categoryId: input.categoryId }, "Fetching menu items for category");

    // Get menu items for this category
    const menuItems = await this.menuRepository.findByCategoryId(input.categoryId);

    logger.info({ categoryId: input.categoryId, itemCount: menuItems.length }, "Menu items fetched successfully");

    return {
      items: menuItems.map((item) => item.toJSON()),
    };
  }
}
