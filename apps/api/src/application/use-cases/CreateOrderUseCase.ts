import { injectable, inject } from "tsyringe";
import { Order } from "../../domain/entities/Order.js";
import type { OrderItem } from "../../domain/entities/Order.js";
import type { IOrderRepository } from "../../domain/repositories/IOrderRepository.js";
import type { IMenuRepository } from "../../domain/repositories/IMenuRepository.js";
import type { IVenueRepository } from "../../domain/repositories/IVenueRepository.js";
import { Money } from "../../domain/value-objects/Money.js";
import { OrderStatus } from "../../domain/value-objects/OrderStatus.js";
import { NotFoundError, ValidationError } from "../../shared/errors/domain-error.js";
import type { Logger } from "@inkwave/utils";
import type { WebSocketManager } from "../../infrastructure/websocket/WebSocketManager.js";

export interface CreateOrderInput {
  venueId: string;
  tableId?: string;
  deviceId?: string;
  pax?: number;
  notes?: string;
  items: Array<{
    itemId: string;
    quantity: number;
    notes?: string;
    optionsJson?: Record<string, unknown>;
  }>;
}

export interface CreateOrderOutput {
  orderId: string;
  status: string;
  total: number;
  createdAt: string;
}

@injectable()
export class CreateOrderUseCase {
  constructor(
    @inject("IOrderRepository") private orderRepository: IOrderRepository,
    @inject("IMenuRepository") private menuRepository: IMenuRepository,
    @inject("IVenueRepository") private venueRepository: IVenueRepository,
    @inject("Logger") private logger: Logger,
    @inject("WebSocketManager") private wsManager: WebSocketManager
  ) {}

  async execute(input: CreateOrderInput): Promise<CreateOrderOutput> {
    this.logger.info(
      { 
        venueId: input.venueId, 
        tableId: input.tableId,
        deviceId: input.deviceId,
        pax: input.pax,
        notes: input.notes,
        itemCount: input.items.length 
      }, 
      "Creating new order"
    );

    // Validate venue exists
    const venue = await this.venueRepository.findById(input.venueId);
    if (!venue) {
      throw new NotFoundError("Venue");
    }

    // Validate all menu items exist and are available
    const orderItems: OrderItem[] = [];
    for (const inputItem of input.items) {
      const menuItem = await this.menuRepository.findById(inputItem.itemId);
      if (!menuItem) {
        throw new NotFoundError(`Menu item ${inputItem.itemId}`);
      }

      if (!menuItem.isAvailable) {
        throw new ValidationError(`Menu item "${menuItem.name}" is not available`);
      }

      orderItems.push({
        id: crypto.randomUUID(),
        itemId: menuItem.id,
        itemName: menuItem.name,
        quantity: inputItem.quantity,
        unitPrice: menuItem.price,
        notes: inputItem.notes,
        optionsJson: inputItem.optionsJson,
      });
    }

    // Create order entity
    const order = Order.create({
      venueId: input.venueId,
      tableId: input.tableId,
      deviceId: input.deviceId,
      pax: input.pax,
      notes: input.notes,
      status: OrderStatus.new(),
      items: orderItems,
    });

    // Save order
    await this.orderRepository.save(order);

    // Broadcast order created event
    this.wsManager.broadcastOrderCreated(input.venueId, order.toJSON());

    this.logger.info({ orderId: order.id, total: order.total.toNumber() }, "Order created successfully");

    return {
      orderId: order.id,
      status: order.status.toString(),
      total: order.total.toNumber(),
      createdAt: order.createdAt.toISOString(),
    };
  }
}

