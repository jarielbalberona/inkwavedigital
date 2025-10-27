import { injectable, inject } from "tsyringe";
import type { IVenueRepository } from "../../domain/repositories/IVenueRepository.js";
import { NotFoundError } from "../../shared/errors/domain-error.js";

export interface DeleteTableInput {
  id: string;
}

@injectable()
export class DeleteTableUseCase {
  constructor(
    @inject("IVenueRepository") private venueRepository: IVenueRepository
  ) {}

  async execute(input: DeleteTableInput): Promise<void> {
    // Verify table exists
    const table = await this.venueRepository.findTableById(input.id);
    if (!table) {
      throw new NotFoundError("Table");
    }

    // Delete table
    await this.venueRepository.deleteTable(input.id);
  }
}

