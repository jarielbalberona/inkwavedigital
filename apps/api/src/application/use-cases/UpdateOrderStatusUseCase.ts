import { injectable, inject } from "tsyringe";
import type { IOrderRepository } from "../../domain/repositories/IOrderRepository.js";
import { OrderStatus } from "../../domain/value-objects/OrderStatus.js";
import { NotFoundError, ValidationError } from "../../shared/errors/domain-error.js";
import type { Logger } from "@inkwave/utils";
// import type { WebSocketManager } from "../../infrastructure/websocket/WebSocketManager.js";

export interface UpdateOrderStatusInput {
  orderId: string;
  newStatus: string;
  updatedBy?: string;
}

export interface UpdateOrderStatusOutput {
  orderId: string;
  status: string;
  updatedAt: string;
}

@injectable()
export class UpdateOrderStatusUseCase {
  constructor(
    @inject("IOrderRepository") private orderRepository: IOrderRepository,
    @inject("Logger") private logger: Logger
    // @inject("WebSocketManager") private wsManager: WebSocketManager
  ) {}

  async execute(input: UpdateOrderStatusInput): Promise<UpdateOrderStatusOutput> {
    this.logger.info({ orderId: input.orderId, newStatus: input.newStatus }, "Updating order status");

    // Find order
    const order = await this.orderRepository.findById(input.orderId);
    if (!order) {
      throw new NotFoundError("Order");
    }

    // Parse and validate new status
    let newStatus: OrderStatus;
    try {
      newStatus = OrderStatus.fromString(input.newStatus);
    } catch (error) {
      throw new ValidationError(`Invalid status: ${input.newStatus}`);
    }

    // Update order status (domain logic validates transition)
    order.updateStatus(newStatus);

    // Save updated order
    await this.orderRepository.save(order);

    // Broadcast order status change (temporarily disabled)
    // this.wsManager.broadcastOrderStatusChanged(order.venueId, order.id, order.status.toString());

    this.logger.info(
      { orderId: order.id, status: order.status.toString() },
      "Order status updated successfully"
    );

    return {
      orderId: order.id,
      status: order.status.toString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}

