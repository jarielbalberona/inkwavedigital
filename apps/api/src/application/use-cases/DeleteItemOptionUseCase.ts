import { injectable, inject } from "tsyringe";
import type { IMenuRepository } from "../../domain/repositories/IMenuRepository.js";
import { NotFoundError } from "../../shared/errors/domain-error.js";

export interface DeleteItemOptionInput {
  id: string;
}

@injectable()
export class DeleteItemOptionUseCase {
  constructor(
    @inject("IMenuRepository") private menuRepository: IMenuRepository
  ) {}

  async execute(input: DeleteItemOptionInput): Promise<void> {
    // Verify option exists
    const option = await this.menuRepository.findItemOptionById(input.id);
    if (!option) {
      throw new NotFoundError("Item option");
    }

    // Delete option (cascades to values in repository)
    await this.menuRepository.deleteItemOption(input.id);
  }
}

