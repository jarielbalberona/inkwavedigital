import { injectable, inject } from "tsyringe";
import type { IVenueRepository } from "../../domain/repositories/IVenueRepository.js";
import { Table } from "../../domain/entities/Table.js";
import { NotFoundError } from "../../shared/errors/domain-error.js";

export interface CreateTableInput {
  venueId: string;
  tableNumber?: number; // Optional, will auto-generate if not provided
  name?: string;
  label: string;
  description?: string;
  capacity?: number;
}

@injectable()
export class CreateTableUseCase {
  constructor(
    @inject("IVenueRepository") private venueRepository: IVenueRepository
  ) {}

  async execute(input: CreateTableInput) {
    // Validate venue exists
    const venue = await this.venueRepository.findById(input.venueId);
    if (!venue) {
      throw new NotFoundError("Venue");
    }

    // Get table number (auto-generate if not provided)
    const tableNumber = input.tableNumber || 
      await this.venueRepository.getNextTableNumber(input.venueId);

    // Create table entity
    const table = Table.create({
      venueId: input.venueId,
      tableNumber,
      name: input.name,
      label: input.label,
      description: input.description,
      capacity: input.capacity,
      isActive: true,
    });

    // Save to database
    await this.venueRepository.saveTable(table);

    return table.toJSON();
  }
}

