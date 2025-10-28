import { injectable, inject } from "tsyringe";
import type { IMenuRepository } from "../../domain/repositories/IMenuRepository.js";
import { NotFoundError } from "../../shared/errors/domain-error.js";

export interface UpdateItemOptionValueInput {
  id: string;
  label?: string;
  priceDelta?: number;
}

@injectable()
export class UpdateItemOptionValueUseCase {
  constructor(
    @inject("IMenuRepository") private menuRepository: IMenuRepository
  ) {}

  async execute(input: UpdateItemOptionValueInput) {
    // Find existing option value
    const value = await this.menuRepository.findOptionValueById(input.id);
    if (!value) {
      throw new NotFoundError("Option value");
    }

    // Update fields if provided
    if (input.label !== undefined) {
      value.updateLabel(input.label);
    }
    if (input.priceDelta !== undefined) {
      value.updatePriceDelta(input.priceDelta);
    }

    // Save updated value
    await this.menuRepository.saveItemOptionValue(value);

    return value.toJSON();
  }
}

