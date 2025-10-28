import { injectable, inject } from "tsyringe";
import type { IMenuRepository } from "../../domain/repositories/IMenuRepository.js";
import { NotFoundError } from "../../shared/errors/domain-error.js";

export interface GetItemOptionsInput {
  itemId: string;
}

@injectable()
export class GetItemOptionsUseCase {
  constructor(
    @inject("IMenuRepository") private menuRepository: IMenuRepository
  ) {}

  async execute(input: GetItemOptionsInput) {
    // Validate menu item exists
    const menuItem = await this.menuRepository.findById(input.itemId);
    if (!menuItem) {
      throw new NotFoundError("Menu item");
    }

    // Fetch all options for the item
    const options = await this.menuRepository.findItemOptions(input.itemId);

    // Fetch values for each option
    const optionsWithValues = await Promise.all(
      options.map(async (option) => {
        const values = await this.menuRepository.findOptionValues(option.id);
        return {
          ...option.toJSON(),
          values: values.map((v) => v.toJSON()),
        };
      })
    );

    return {
      options: optionsWithValues,
    };
  }
}

