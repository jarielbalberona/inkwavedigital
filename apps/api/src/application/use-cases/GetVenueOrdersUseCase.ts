import { injectable, inject } from "tsyringe";
import type { IOrderRepository } from "../../domain/repositories/IOrderRepository.js";
import type { IVenueRepository } from "../../domain/repositories/IVenueRepository.js";
import { NotFoundError } from "../../shared/errors/domain-error.js";
import type { Logger } from "@inkwave/utils";

export interface GetVenueOrdersInput {
  venueId: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export interface GetVenueOrdersOutput {
  orders: Array<{
    id: string;
    venueId: string;
    tableId?: string;
    status: string;
    items: Array<{
      id: string;
      itemId: string;
      itemName: string;
      quantity: number;
      unitPrice: number;
      notes?: string;
      optionsJson?: Record<string, unknown>;
    }>;
    deviceId?: string;
    total: number;
    createdAt: string;
    updatedAt: string;
  }>;
  total: number;
}

@injectable()
export class GetVenueOrdersUseCase {
  constructor(
    @inject("IOrderRepository") private orderRepository: IOrderRepository,
    @inject("IVenueRepository") private venueRepository: IVenueRepository,
    @inject("Logger") private logger: Logger
  ) {}

  async execute(input: GetVenueOrdersInput): Promise<GetVenueOrdersOutput> {
    this.logger.info({ venueId: input.venueId, status: input.status, dateFrom: input.dateFrom, dateTo: input.dateTo }, "Fetching orders for venue");

    // Validate venue exists
    const venue = await this.venueRepository.findById(input.venueId);
    if (!venue) {
      throw new NotFoundError("Venue");
    }

    // Fetch orders
    const orders = await this.orderRepository.findByVenueId(input.venueId, {
      status: input.status,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
      limit: input.limit ?? 50,
      offset: input.offset ?? 0,
    });

    // Get total count
    const total = await this.orderRepository.countByVenueId(input.venueId, {
      status: input.status,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
    });

    this.logger.info(
      { venueId: input.venueId, orderCount: orders.length, total },
      "Orders fetched successfully"
    );

    return {
      orders: orders.map((order) => order.toJSON()),
      total,
    };
  }
}

