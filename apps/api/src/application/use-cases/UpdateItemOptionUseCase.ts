import { injectable, inject } from "tsyringe";
import type { IMenuRepository } from "../../domain/repositories/IMenuRepository.js";
import { NotFoundError } from "../../shared/errors/domain-error.js";

export interface UpdateItemOptionInput {
  id: string;
  name?: string;
  type?: "select" | "multi";
  required?: boolean;
}

@injectable()
export class UpdateItemOptionUseCase {
  constructor(
    @inject("IMenuRepository") private menuRepository: IMenuRepository
  ) {}

  async execute(input: UpdateItemOptionInput) {
    // Find existing option
    const option = await this.menuRepository.findItemOptionById(input.id);
    if (!option) {
      throw new NotFoundError("Item option");
    }

    // Update fields if provided
    if (input.name !== undefined) {
      option.updateName(input.name);
    }
    if (input.type !== undefined) {
      option.updateType(input.type);
    }
    if (input.required !== undefined) {
      option.setRequired(input.required);
    }

    // Save updated option
    await this.menuRepository.saveItemOption(option);

    return option.toJSON();
  }
}

