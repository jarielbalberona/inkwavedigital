import { injectable, inject } from "tsyringe";
import type { IOrderRepository } from "../../domain/repositories/IOrderRepository.js";
import { OrderStatus } from "../../domain/value-objects/OrderStatus.js";
import { NotFoundError, ValidationError } from "../../shared/errors/domain-error.js";
import type { Logger } from "@inkwave/utils";
import type { WebSocketManager } from "../../infrastructure/websocket/WebSocketManager.js";
import type { PushNotificationService } from "../../infrastructure/push/PushNotificationService.js";

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
    @inject("Logger") private logger: Logger,
    @inject("WebSocketManager") private wsManager: WebSocketManager,
    @inject("PushNotificationService") private pushService: PushNotificationService
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

    // Broadcast order status change via WebSocket
    this.wsManager.broadcastOrderStatusChanged(order.venueId, order.id, order.status.toString());

    // Send push notification to customer if they have a deviceId
    if (order.deviceId) {
      const orderNumber = order.id.slice(0, 8);
      const statusEmoji = this.getStatusEmoji(order.status.toString());
      const statusMessage = this.getStatusMessage(order.status.toString());
      
      this.pushService.sendToDevice(order.deviceId, {
        title: `${statusEmoji} ${statusMessage}`,
        body: `Order #${orderNumber} - ${this.getStatusDescription(order.status.toString())}`,
        icon: '/icon.png',
        badge: '/badge.png',
        tag: `order-${order.id}`,
        requireInteraction: order.status.toString() === 'READY',
        data: {
          orderId: order.id,
          status: order.status.toString(),
          url: `/orders/${order.id}`,
        },
      }).catch((error) => {
        this.logger.error({ error, orderId: order.id }, "Failed to send push notification");
      });
    }

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

  private getStatusEmoji(status: string): string {
    switch (status) {
      case 'NEW': return '📝';
      case 'PREPARING': return '👨‍🍳';
      case 'READY': return '🍽️';
      case 'SERVED': return '✅';
      default: return '🔔';
    }
  }

  private getStatusMessage(status: string): string {
    switch (status) {
      case 'NEW': return 'Order Received';
      case 'PREPARING': return 'Order Being Prepared';
      case 'READY': return 'Order Ready!';
      case 'SERVED': return 'Order Served';
      default: return 'Order Updated';
    }
  }

  private getStatusDescription(status: string): string {
    switch (status) {
      case 'NEW': return 'Your order has been received';
      case 'PREPARING': return 'Your order is being prepared';
      case 'READY': return 'Your order is ready for pickup!';
      case 'SERVED': return 'Enjoy your meal!';
      default: return 'Your order status has been updated';
    }
  }
}

