import { injectable, inject } from "tsyringe";
import type { IMenuRepository } from "../../domain/repositories/IMenuRepository.js";
import type { IVenueRepository } from "../../domain/repositories/IVenueRepository.js";
import { NotFoundError } from "../../shared/errors/domain-error.js";
import { createLogger } from "@inkwave/utils";

const logger = createLogger("get-active-menu-use-case");

export interface GetActiveMenuInput {
  venueId: string;
}

export interface GetActiveMenuOutput {
  menu: {
    id: string;
    venueId: string;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
}

@injectable()
export class GetActiveMenuUseCase {
  constructor(
    @inject("IMenuRepository") private menuRepository: IMenuRepository,
    @inject("IVenueRepository") private venueRepository: IVenueRepository
  ) {}

  async execute(input: GetActiveMenuInput): Promise<GetActiveMenuOutput> {
    logger.info({ venueId: input.venueId }, "Fetching active menu for venue");

    // Validate venue exists
    const venue = await this.venueRepository.findById(input.venueId);
    if (!venue) {
      throw new NotFoundError("Venue");
    }

    // Get active menu
    const menu = await this.menuRepository.findActiveMenuByVenueId(input.venueId);

    if (!menu) {
      logger.warn({ venueId: input.venueId }, "No active menu found for venue");
      return { menu: null };
    }

    logger.info({ venueId: input.venueId, menuId: menu.id }, "Active menu fetched successfully");

    return {
      menu: menu.toJSON(),
    };
  }
}

