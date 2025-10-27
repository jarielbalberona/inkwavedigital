import { injectable, inject } from "tsyringe";
import type { IMenuRepository } from "../../domain/repositories/IMenuRepository.js";
import { NotFoundError } from "../../shared/errors/domain-error.js";
import { createLogger } from "@inkwave/utils";

const logger = createLogger("delete-category-use-case");

export interface DeleteCategoryInput {
  id: string;
}

@injectable()
export class DeleteCategoryUseCase {
  constructor(
    @inject("IMenuRepository") private menuRepository: IMenuRepository
  ) {}

  async execute(input: DeleteCategoryInput): Promise<void> {
    logger.info({ categoryId: input.id }, "Deleting category");

    // Check if category exists
    const existingCategory = await this.menuRepository.findCategoryById(input.id);
    if (!existingCategory) {
      throw new NotFoundError("Category");
    }

    await this.menuRepository.deleteCategory(input.id);

    logger.info({ categoryId: input.id }, "Category deleted successfully");
  }
}
