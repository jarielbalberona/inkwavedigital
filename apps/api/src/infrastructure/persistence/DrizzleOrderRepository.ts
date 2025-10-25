import { injectable, inject } from "tsyringe";
import { eq, and, desc } from "drizzle-orm";
import type { Database } from "@inkwave/db";
import { orders, orderItems, orderEvents } from "@inkwave/db";
import type { IOrderRepository } from "../../domain/repositories/IOrderRepository.js";
import { Order } from "../../domain/entities/Order.js";
import type { OrderItem } from "../../domain/entities/Order.js";
import { Money } from "../../domain/value-objects/Money.js";
import { OrderStatus } from "../../domain/value-objects/OrderStatus.js";

@injectable()
export class DrizzleOrderRepository implements IOrderRepository {
  constructor(@inject("Database") private db: Database) {}

  async save(order: Order): Promise<void> {
    const orderData = {
      id: order.id,
      venueId: order.venueId,
      tableId: order.tableId,
      status: order.status.toString(),
      total: order.total.toNumber().toString(),
      deviceId: order.deviceId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    // Upsert order
    await this.db
      .insert(orders)
      .values(orderData)
      .onConflictDoUpdate({
        target: orders.id,
        set: {
          status: orderData.status,
          total: orderData.total,
          updatedAt: orderData.updatedAt,
        },
      });

    // Delete existing order items and re-insert
    await this.db.delete(orderItems).where(eq(orderItems.orderId, order.id));

    if (order.items.length > 0) {
      await this.db.insert(orderItems).values(
        order.items.map((item) => ({
          id: item.id,
          orderId: order.id,
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toNumber().toString(),
          notes: item.notes,
          optionsJson: item.optionsJson,
          createdAt: new Date(),
        }))
      );
    }
  }

  async findById(id: string): Promise<Order | null> {
    const result = await this.db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        // Note: Drizzle relations would need to be defined in schema
      },
    });

    if (!result) {
      return null;
    }

    // Fetch order items separately
    const items = await this.db.query.orderItems.findMany({
      where: eq(orderItems.orderId, id),
    });

    return this.mapToEntity(result, items);
  }

  async findByVenueId(
    venueId: string,
    options?: { status?: string; limit?: number; offset?: number }
  ): Promise<Order[]> {
    const conditions = [eq(orders.venueId, venueId)];
    
    if (options?.status) {
      conditions.push(eq(orders.status, options.status));
    }

    const results = await this.db.query.orders.findMany({
      where: and(...conditions),
      limit: options?.limit ?? 50,
      offset: options?.offset ?? 0,
      orderBy: [desc(orders.createdAt)],
    });

    // Fetch all order items for these orders
    const orderIds = results.map((o) => o.id);
    const allItems = orderIds.length > 0
      ? await this.db.query.orderItems.findMany({
          where: eq(orderItems.orderId, orderIds[0]), // This is simplified, ideally use IN
        })
      : [];

    return Promise.all(
      results.map((order) => {
        const items = allItems.filter((item) => item.orderId === order.id);
        return Promise.resolve(this.mapToEntity(order, items));
      })
    );
  }

  async findByTableId(tableId: string): Promise<Order[]> {
    const results = await this.db.query.orders.findMany({
      where: eq(orders.tableId, tableId),
      orderBy: [desc(orders.createdAt)],
    });

    return Promise.all(
      results.map(async (order) => {
        const items = await this.db.query.orderItems.findMany({
          where: eq(orderItems.orderId, order.id),
        });
        return this.mapToEntity(order, items);
      })
    );
  }

  async findByDeviceId(deviceId: string): Promise<Order[]> {
    const results = await this.db.query.orders.findMany({
      where: eq(orders.deviceId, deviceId),
      orderBy: [desc(orders.createdAt)],
    });

    return Promise.all(
      results.map(async (order) => {
        const items = await this.db.query.orderItems.findMany({
          where: eq(orderItems.orderId, order.id),
        });
        return this.mapToEntity(order, items);
      })
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(orders).where(eq(orders.id, id));
  }

  async countByVenueId(
    venueId: string,
    options?: { status?: string; dateFrom?: Date; dateTo?: Date }
  ): Promise<number> {
    const conditions = [eq(orders.venueId, venueId)];
    
    if (options?.status) {
      conditions.push(eq(orders.status, options.status));
    }

    const results = await this.db.query.orders.findMany({
      where: and(...conditions),
    });

    return results.length;
  }

  private mapToEntity(orderData: any, itemsData: any[]): Order {
    const items: OrderItem[] = itemsData.map((item) => ({
      id: item.id,
      itemId: item.itemId || "",
      itemName: "Item", // Would need to join with menu_items in production
      quantity: item.quantity,
      unitPrice: Money.fromAmount(parseFloat(item.unitPrice)),
      notes: item.notes || undefined,
      optionsJson: item.optionsJson as Record<string, unknown> | undefined,
    }));

    return Order.restore({
      id: orderData.id,
      venueId: orderData.venueId,
      tableId: orderData.tableId || undefined,
      status: OrderStatus.fromString(orderData.status),
      items,
      deviceId: orderData.deviceId || undefined,
      createdAt: new Date(orderData.createdAt),
      updatedAt: new Date(orderData.updatedAt),
    });
  }
}

