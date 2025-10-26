import { injectable, inject } from "tsyringe";
import type { IVenueRepository } from "../../domain/repositories/IVenueRepository.js";
import { NotFoundError } from "../../shared/errors/domain-error.js";
import type { Logger } from "@inkwave/utils";

export interface GetVenueTablesInput {
  venueId: string;
}

export interface GetVenueTablesOutput {
  tables: Array<{
    id: string;
    label: string;
    venueId: string;
    qrCode?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  total: number;
}

@injectable()
export class GetVenueTablesUseCase {
  constructor(
    @inject("IVenueRepository") private venueRepository: IVenueRepository,
    @inject("Logger") private logger: Logger
  ) {}

  async execute(input: GetVenueTablesInput): Promise<GetVenueTablesOutput> {
    this.logger.info({ venueId: input.venueId }, "Fetching tables for venue");

    // Validate venue exists
    const venue = await this.venueRepository.findById(input.venueId);
    if (!venue) {
      throw new NotFoundError("Venue");
    }

    // Fetch tables for venue
    const tables = await this.venueRepository.findTablesByVenueId(input.venueId);

    this.logger.info(
      { venueId: input.venueId, tableCount: tables.length },
      "Tables fetched successfully"
    );

    return {
      tables: tables.map((table) => ({
        id: table.id,
        label: table.label,
        venueId: table.venueId,
        qrCode: table.qrCode,
        isActive: table.isActive,
        createdAt: table.createdAt.toISOString(),
        updatedAt: table.updatedAt.toISOString(),
      })),
      total: tables.length,
    };
  }
}
