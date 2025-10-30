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
import type { PushNotificationService } from "../../infrastructure/push/PushNotificationService.js";

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
    @inject("WebSocketManager") private wsManager: WebSocketManager,
    @inject("PushNotificationService") private pushService: PushNotificationService
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

      // Calculate unit price including option deltas
      let unitPrice = menuItem.price.toNumber();
      
      // Parse and validate options if provided
      if (inputItem.optionsJson) {
        try {
          const selectedOptions = typeof inputItem.optionsJson === 'string' 
            ? JSON.parse(inputItem.optionsJson) 
            : inputItem.optionsJson;

          // Fetch item options to validate and calculate price
          const itemOptions = await this.menuRepository.findItemOptions(menuItem.id);
          
          // Validate required options are selected
          for (const option of itemOptions) {
            if (option.required) {
              const selectedOption = Array.isArray(selectedOptions) 
                ? selectedOptions.find((so: any) => so.optionId === option.id)
                : null;
              
              if (!selectedOption || !selectedOption.values || selectedOption.values.length === 0) {
                throw new ValidationError(`Required option "${option.name}" must be selected for item "${menuItem.name}"`);
              }
            }
          }

          // Calculate price deltas from selected options
          if (Array.isArray(selectedOptions)) {
            for (const selectedOption of selectedOptions) {
              if (selectedOption.values && Array.isArray(selectedOption.values)) {
                for (const value of selectedOption.values) {
                  if (typeof value.priceDelta === 'number') {
                    unitPrice += value.priceDelta;
                  }
                }
              }
            }
          }
        } catch (error) {
          if (error instanceof ValidationError) {
            throw error;
          }
          this.logger.warn({ error, itemId: inputItem.itemId }, "Failed to parse options JSON");
          throw new ValidationError(`Invalid options format for item "${menuItem.name}"`);
        }
      }

      orderItems.push({
        id: crypto.randomUUID(),
        itemId: menuItem.id,
        itemName: menuItem.name,
        quantity: inputItem.quantity,
        unitPrice: Money.fromAmount(unitPrice),
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

    // Broadcast order created event via WebSocket
    this.wsManager.broadcastOrderCreated(input.venueId, order.toJSON());

    // Send push notification to venue staff
    const orderNumber = order.id.slice(0, 8);
    const itemCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const tableInfo = input.tableId ? `Table ${input.tableId}` : (input.deviceId ? `Device ${input.deviceId.slice(0, 8)}` : 'Takeout');
    
    this.pushService.sendToVenue(input.venueId, {
      title: '🔔 New Order!',
      body: `Order #${orderNumber} from ${tableInfo} - ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`,
      icon: '/icon.png',
      badge: '/badge.png',
      tag: `order-${order.id}`,
      requireInteraction: true,
      data: {
        orderId: order.id,
        venueId: input.venueId,
        url: `/orders/${order.id}`,
      },
    }).catch((error) => {
      this.logger.error({ error, orderId: order.id }, "Failed to send push notification to venue");
    });

    this.logger.info({ orderId: order.id, total: order.total.toNumber() }, "Order created successfully");

    return {
      orderId: order.id,
      status: order.status.toString(),
      total: order.total.toNumber(),
      createdAt: order.createdAt.toISOString(),
    };
  }
}

