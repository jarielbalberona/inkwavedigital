import { injectable, inject } from "tsyringe";
import type { IMenuRepository } from "../../domain/repositories/IMenuRepository.js";
import { ItemOptionValue } from "../../domain/entities/ItemOptionValue.js";
import { NotFoundError } from "../../shared/errors/domain-error.js";

export interface CreateItemOptionValueInput {
  optionId: string;
  label: string;
  priceDelta: number;
}

@injectable()
export class CreateItemOptionValueUseCase {
  constructor(
    @inject("IMenuRepository") private menuRepository: IMenuRepository
  ) {}

  async execute(input: CreateItemOptionValueInput) {
    // Validate option exists
    const option = await this.menuRepository.findItemOptionById(input.optionId);
    if (!option) {
      throw new NotFoundError("Item option");
    }

    // Create option value entity
    const value = ItemOptionValue.create({
      optionId: input.optionId,
      label: input.label,
      priceDelta: input.priceDelta,
    });

    // Save to database
    await this.menuRepository.saveItemOptionValue(value);

    return value.toJSON();
  }
}

