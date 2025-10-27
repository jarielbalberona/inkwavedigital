import { injectable, inject } from "tsyringe";
import type { IVenueRepository } from "../../domain/repositories/IVenueRepository.js";

export interface DeleteVenueInput {
  venueId: string;
}

@injectable()
export class DeleteVenueUseCase {
  constructor(@inject("IVenueRepository") private venueRepository: IVenueRepository) {}

  async execute(input: DeleteVenueInput): Promise<void> {
    const exists = await this.venueRepository.exists(input.venueId);

    if (!exists) {
      throw new Error("Venue not found");
    }

    await this.venueRepository.delete(input.venueId);
  }
}
