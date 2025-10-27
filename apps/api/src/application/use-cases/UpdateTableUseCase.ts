import { injectable, inject } from "tsyringe";
import type { IVenueRepository } from "../../domain/repositories/IVenueRepository.js";
import { NotFoundError } from "../../shared/errors/domain-error.js";

export interface UpdateTableInput {
  id: string;
  tableNumber?: number;
  name?: string;
  label?: string;
  description?: string;
  capacity?: number;
  isActive?: boolean;
}

@injectable()
export class UpdateTableUseCase {
  constructor(
    @inject("IVenueRepository") private venueRepository: IVenueRepository
  ) {}

  async execute(input: UpdateTableInput) {
    // Find existing table
    const table = await this.venueRepository.findTableById(input.id);
    if (!table) {
      throw new NotFoundError("Table");
    }

    // Update fields if provided
    if (input.tableNumber !== undefined) {
      table.updateTableNumber(input.tableNumber);
    }
    if (input.name !== undefined) {
      table.updateName(input.name);
    }
    if (input.label !== undefined) {
      table.updateLabel(input.label);
    }
    if (input.description !== undefined) {
      table.updateDescription(input.description);
    }
    if (input.capacity !== undefined) {
      table.updateCapacity(input.capacity);
    }
    if (input.isActive !== undefined) {
      if (input.isActive) {
        table.activate();
      } else {
        table.deactivate();
      }
    }

    // Save updated table
    await this.venueRepository.saveTable(table);

    return table.toJSON();
  }
}

