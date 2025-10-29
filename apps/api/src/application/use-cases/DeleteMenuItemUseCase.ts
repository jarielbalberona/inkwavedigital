import { injectable, inject } from "tsyringe";
import type { IMenuRepository } from "../../domain/repositories/IMenuRepository.js";
import { NotFoundError } from "../../shared/errors/domain-error.js";
import { createLogger } from "@inkwave/utils";

const logger = createLogger("delete-menu-item-use-case");

export interface DeleteMenuItemInput {
  itemId: string;
}

@injectable()
export class DeleteMenuItemUseCase {
  constructor(
    @inject("IMenuRepository") private menuRepository: IMenuRepository
  ) {}

  async execute(input: DeleteMenuItemInput): Promise<void> {
    logger.info({ itemId: input.itemId }, "Deleting menu item");

    // Verify menu item exists
    const menuItem = await this.menuRepository.findById(input.itemId);
    if (!menuItem) {
      throw new NotFoundError("Menu item not found");
    }

    await this.menuRepository.delete(input.itemId);

    logger.info({ itemId: input.itemId }, "Menu item deleted successfully");
  }
}

