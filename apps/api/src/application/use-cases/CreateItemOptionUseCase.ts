import { injectable, inject } from "tsyringe";
import type { IMenuRepository } from "../../domain/repositories/IMenuRepository.js";
import { ItemOption } from "../../domain/entities/ItemOption.js";
import { NotFoundError } from "../../shared/errors/domain-error.js";

export interface CreateItemOptionInput {
  itemId: string;
  name: string;
  type: "select" | "multi";
  required: boolean;
}

@injectable()
export class CreateItemOptionUseCase {
  constructor(
    @inject("IMenuRepository") private menuRepository: IMenuRepository
  ) {}

  async execute(input: CreateItemOptionInput) {
    // Validate menu item exists
    const menuItem = await this.menuRepository.findById(input.itemId);
    if (!menuItem) {
      throw new NotFoundError("Menu item");
    }

    // Create option entity
    const option = ItemOption.create({
      itemId: input.itemId,
      name: input.name,
      type: input.type,
      required: input.required,
    });

    // Save to database
    await this.menuRepository.saveItemOption(option);

    return option.toJSON();
  }
}

