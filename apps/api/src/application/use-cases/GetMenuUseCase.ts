import { injectable, inject } from "tsyringe";
import type { IMenuRepository } from "../../domain/repositories/IMenuRepository.js";
import type { IVenueRepository } from "../../domain/repositories/IVenueRepository.js";
import { NotFoundError } from "../../shared/errors/domain-error.js";
import type { Logger } from "@inkwave/utils";

export interface GetMenuInput {
  venueId: string;
  availableOnly?: boolean;
}

export interface GetMenuOutput {
  items: Array<{
    id: string;
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    isAvailable: boolean;
    options: Array<{
      id: string;
      name: string;
      type: string;
      required: boolean;
      values: Array<{
        id: string;
        label: string;
        priceDelta: number;
      }>;
    }>;
  }>;
}

@injectable()
export class GetMenuUseCase {
  constructor(
    @inject("IMenuRepository") private menuRepository: IMenuRepository,
    @inject("IVenueRepository") private venueRepository: IVenueRepository,
    @inject("Logger") private logger: Logger
  ) {}

  async execute(input: GetMenuInput): Promise<GetMenuOutput> {
    this.logger.info({ venueId: input.venueId }, "Fetching menu for venue");

    // Validate venue exists
    const venue = await this.venueRepository.findById(input.venueId);
    if (!venue) {
      throw new NotFoundError("Venue");
    }

    // Fetch menu items
    const menuItems = await this.menuRepository.findByVenueId(input.venueId, {
      availableOnly: input.availableOnly ?? false,
    });

    this.logger.info({ venueId: input.venueId, itemCount: menuItems.length }, "Menu fetched successfully");

    return {
      items: menuItems.map((item) => item.toJSON()),
    };
  }
}

