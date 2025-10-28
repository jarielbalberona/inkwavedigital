import { injectable, inject } from "tsyringe";
import type { IMenuRepository } from "../../domain/repositories/IMenuRepository.js";
import { NotFoundError } from "../../shared/errors/domain-error.js";

export interface DeleteItemOptionValueInput {
  id: string;
}

@injectable()
export class DeleteItemOptionValueUseCase {
  constructor(
    @inject("IMenuRepository") private menuRepository: IMenuRepository
  ) {}

  async execute(input: DeleteItemOptionValueInput): Promise<void> {
    // Verify option value exists
    const value = await this.menuRepository.findOptionValueById(input.id);
    if (!value) {
      throw new NotFoundError("Option value");
    }

    // Delete option value
    await this.menuRepository.deleteItemOptionValue(input.id);
  }
}

