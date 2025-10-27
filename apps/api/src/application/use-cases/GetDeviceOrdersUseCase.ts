import { injectable, inject } from "tsyringe";
import type { IOrderRepository } from "../../domain/repositories/IOrderRepository.js";

export interface GetDeviceOrdersInput {
  deviceId: string;
  venueId?: string;
}

@injectable()
export class GetDeviceOrdersUseCase {
  constructor(
    @inject("IOrderRepository") private orderRepository: IOrderRepository
  ) {}

  async execute(input: GetDeviceOrdersInput) {
    const orders = await this.orderRepository.findByDeviceId(
      input.deviceId,
      input.venueId
    );

    // Get start of today (midnight)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Filter to only active orders from today
    const activeOrders = orders.filter((order) => {
      const isActive = !["COMPLETED", "CANCELLED"].includes(order.status.toString());
      const isToday = order.createdAt >= startOfToday;
      return isActive && isToday;
    });

    return activeOrders;
  }
}

