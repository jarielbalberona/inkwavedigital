import { injectable, inject } from "tsyringe";
import type { IMenuRepository } from "../../domain/repositories/IMenuRepository.js";
import { NotFoundError, ValidationError } from "../../shared/errors/domain-error.js";
import { createLogger } from "@inkwave/utils";

const logger = createLogger("update-category-use-case");

export interface UpdateCategoryInput {
  id: string;
  name?: string;
  sortIndex?: number;
  iconUrl?: string;
}

export interface UpdateCategoryOutput {
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
export class UpdateCategoryUseCase {
  constructor(
    @inject("IMenuRepository") private menuRepository: IMenuRepository
  ) {}

  async execute(input: UpdateCategoryInput): Promise<UpdateCategoryOutput> {
    logger.info({ categoryId: input.id }, "Updating category");

    // Find existing category
    const existingCategory = await this.menuRepository.findCategoryById(input.id);
    if (!existingCategory) {
      throw new NotFoundError("Category");
    }

    // Update fields
    if (input.name !== undefined) {
      existingCategory.updateName(input.name);
    }
    if (input.sortIndex !== undefined) {
      existingCategory.updateSortIndex(input.sortIndex);
    }
    if (input.iconUrl !== undefined) {
      existingCategory.updateIconUrl(input.iconUrl);
    }

    await this.menuRepository.saveCategory(existingCategory);

    logger.info({ categoryId: input.id }, "Category updated successfully");

    return {
      category: existingCategory.toJSON(),
    };
  }
}
