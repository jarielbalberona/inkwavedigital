import { injectable, inject } from "tsyringe";
import { eq, and, desc, inArray, gte, lte } from "drizzle-orm";
import type { Database } from "@inkwave/db";
import { orders, orderItems, menuItems, tables } from "@inkwave/db";
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
      pax: order.pax,
      isToGo: order.isToGo,
      notes: order.notes,
      staffNotes: order.staffNotes,
      cancellationReason: order.cancellationReason,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    // Check if order already exists
    const existingOrder = await this.db.query.orders.findFirst({
      where: eq(orders.id, order.id),
    });

    if (existingOrder) {
      // Update existing order
      await this.db
        .update(orders)
        .set({
          status: order.status.toString(),
          total: order.total.toNumber().toString(),
          deviceId: order.deviceId,
          pax: order.pax,
          isToGo: order.isToGo,
          notes: order.notes,
          updatedAt: order.updatedAt,
        })
        .where(eq(orders.id, order.id));
    } else {
      // Insert new order
      await this.db.insert(orders).values(orderData);

      // Insert order items
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
            updatedAt: new Date(),
          }))
        );
      }
    }
  }

  async findById(id: string): Promise<Order | null> {
    // Fetch order with table label
    const orderResults = await this.db
      .select({
        id: orders.id,
        venueId: orders.venueId,
        tableId: orders.tableId,
        tableLabel: tables.label,
        status: orders.status,
        total: orders.total,
        deviceId: orders.deviceId,
        pax: orders.pax,
        isToGo: orders.isToGo,
        notes: orders.notes,
        staffNotes: orders.staffNotes,
        cancellationReason: orders.cancellationReason,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .where(eq(orders.id, id))
      .limit(1);

    if (orderResults.length === 0) {
      return null;
    }

    const result = orderResults[0];

    // Fetch order items with menu item names
    const items = await this.db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        itemId: orderItems.itemId,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        notes: orderItems.notes,
        optionsJson: orderItems.optionsJson,
        itemName: menuItems.name,
      })
      .from(orderItems)
      .leftJoin(menuItems, eq(orderItems.itemId, menuItems.id))
      .where(eq(orderItems.orderId, id));

    return this.mapToEntity(result, items);
  }

  async findByVenueId(
    venueId: string,
    options?: { status?: string; dateFrom?: Date; dateTo?: Date; limit?: number; offset?: number }
  ): Promise<Order[]> {
    const conditions = [eq(orders.venueId, venueId)];
    
    if (options?.status) {
      conditions.push(eq(orders.status, options.status));
    }

    if (options?.dateFrom) {
      conditions.push(gte(orders.createdAt, options.dateFrom));
    }

    if (options?.dateTo) {
      conditions.push(lte(orders.createdAt, options.dateTo));
    }

    // Fetch orders with table labels
    const orderResults = await this.db
      .select({
        id: orders.id,
        venueId: orders.venueId,
        tableId: orders.tableId,
        tableLabel: tables.label,
        status: orders.status,
        total: orders.total,
        deviceId: orders.deviceId,
        pax: orders.pax,
        isToGo: orders.isToGo,
        notes: orders.notes,
        staffNotes: orders.staffNotes,
        cancellationReason: orders.cancellationReason,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .where(and(...conditions))
      .limit(options?.limit ?? 50)
      .offset(options?.offset ?? 0)
      .orderBy(desc(orders.createdAt));

    // Fetch all order items for these orders with menu item names
    const orderIds = orderResults.map((o) => o.id);
    const allItems = orderIds.length > 0
      ? await this.db
          .select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            itemId: orderItems.itemId,
            quantity: orderItems.quantity,
            unitPrice: orderItems.unitPrice,
            notes: orderItems.notes,
            optionsJson: orderItems.optionsJson,
            itemName: menuItems.name,
          })
          .from(orderItems)
          .leftJoin(menuItems, eq(orderItems.itemId, menuItems.id))
          .where(inArray(orderItems.orderId, orderIds))
      : [];

    return Promise.all(
      orderResults.map((order) => {
        const items = allItems.filter((item) => item.orderId === order.id);
        return Promise.resolve(this.mapToEntity(order, items));
      })
    );
  }

  async findByTableId(tableId: string): Promise<Order[]> {
    // Fetch orders with table labels
    const orderResults = await this.db
      .select({
        id: orders.id,
        venueId: orders.venueId,
        tableId: orders.tableId,
        tableLabel: tables.label,
        status: orders.status,
        total: orders.total,
        deviceId: orders.deviceId,
        pax: orders.pax,
        isToGo: orders.isToGo,
        notes: orders.notes,
        staffNotes: orders.staffNotes,
        cancellationReason: orders.cancellationReason,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .where(eq(orders.tableId, tableId))
      .orderBy(desc(orders.createdAt));

    // Fetch all order items for these orders with menu item names
    const orderIds = orderResults.map((o) => o.id);
    const allItems = orderIds.length > 0
      ? await this.db
          .select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            itemId: orderItems.itemId,
            quantity: orderItems.quantity,
            unitPrice: orderItems.unitPrice,
            notes: orderItems.notes,
            optionsJson: orderItems.optionsJson,
            itemName: menuItems.name,
          })
          .from(orderItems)
          .leftJoin(menuItems, eq(orderItems.itemId, menuItems.id))
          .where(inArray(orderItems.orderId, orderIds))
      : [];

    return Promise.all(
      orderResults.map((order) => {
        const items = allItems.filter((item) => item.orderId === order.id);
        return Promise.resolve(this.mapToEntity(order, items));
      })
    );
  }

  async findByDeviceId(deviceId: string, venueId?: string): Promise<Order[]> {
    const conditions = venueId
      ? and(eq(orders.deviceId, deviceId), eq(orders.venueId, venueId))
      : eq(orders.deviceId, deviceId);

    // Fetch orders with table labels
    const orderResults = await this.db
      .select({
        id: orders.id,
        venueId: orders.venueId,
        tableId: orders.tableId,
        tableLabel: tables.label,
        status: orders.status,
        total: orders.total,
        deviceId: orders.deviceId,
        pax: orders.pax,
        isToGo: orders.isToGo,
        notes: orders.notes,
        staffNotes: orders.staffNotes,
        cancellationReason: orders.cancellationReason,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .where(conditions)
      .orderBy(desc(orders.createdAt));

    // Fetch all order items for these orders with menu item names
    const orderIds = orderResults.map((o) => o.id);
    const allItems = orderIds.length > 0
      ? await this.db
          .select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            itemId: orderItems.itemId,
            quantity: orderItems.quantity,
            unitPrice: orderItems.unitPrice,
            notes: orderItems.notes,
            optionsJson: orderItems.optionsJson,
            itemName: menuItems.name,
          })
          .from(orderItems)
          .leftJoin(menuItems, eq(orderItems.itemId, menuItems.id))
          .where(inArray(orderItems.orderId, orderIds))
      : [];

    return Promise.all(
      orderResults.map((order) => {
        const items = allItems.filter((item) => item.orderId === order.id);
        return Promise.resolve(this.mapToEntity(order, items));
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

    if (options?.dateFrom) {
      conditions.push(gte(orders.createdAt, options.dateFrom));
    }

    if (options?.dateTo) {
      conditions.push(lte(orders.createdAt, options.dateTo));
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
      itemName: item.itemName || "Unknown Item",
      quantity: item.quantity,
      unitPrice: Money.fromAmount(parseFloat(item.unitPrice)),
      notes: item.notes || undefined,
      optionsJson: item.optionsJson as Record<string, unknown> | undefined,
    }));

    return Order.restore({
      id: orderData.id,
      venueId: orderData.venueId,
      tableId: orderData.tableId || undefined,
      tableLabel: orderData.tableLabel || undefined,
      status: OrderStatus.fromString(orderData.status),
      items,
      deviceId: orderData.deviceId || undefined,
      pax: orderData.pax || undefined,
      isToGo: orderData.isToGo ?? undefined,
      notes: orderData.notes || undefined,
      staffNotes: orderData.staffNotes || undefined,
      cancellationReason: orderData.cancellationReason || undefined,
      createdAt: new Date(orderData.createdAt),
      updatedAt: new Date(orderData.updatedAt),
    });
  }
}

