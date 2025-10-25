import { Order } from "../entities/Order.js";

export interface IOrderRepository {
  /**
   * Save a new or updated order
   */
  save(order: Order): Promise<void>;

  /**
   * Find an order by ID
   */
  findById(id: string): Promise<Order | null>;

  /**
   * Find all orders for a venue
   */
  findByVenueId(venueId: string, options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Order[]>;

  /**
   * Find orders by table ID
   */
  findByTableId(tableId: string): Promise<Order[]>;

  /**
   * Find orders by device ID (for anonymous customers)
   */
  findByDeviceId(deviceId: string): Promise<Order[]>;

  /**
   * Delete an order
   */
  delete(id: string): Promise<void>;

  /**
   * Get order count for a venue
   */
  countByVenueId(venueId: string, options?: {
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<number>;
}

