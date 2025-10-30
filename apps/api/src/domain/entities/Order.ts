import { ValidationError } from "../../shared/errors/domain-error.js";
import { Money } from "../value-objects/Money.js";
import { OrderStatus } from "../value-objects/OrderStatus.js";

export interface OrderItem {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: Money;
  notes?: string;
  optionsJson?: Record<string, unknown>;
}

export interface OrderProps {
  id: string;
  venueId: string;
  tableId?: string;
  tableLabel?: string;
  status: OrderStatus;
  items: OrderItem[];
  deviceId?: string;
  pax?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Order {
  private constructor(private props: OrderProps) {
    this.validate();
  }

  static create(data: Omit<OrderProps, "id" | "createdAt" | "updatedAt">): Order {
    return new Order({
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: OrderProps): Order {
    return new Order(props);
  }

  private validate(): void {
    if (!this.props.venueId) {
      throw new ValidationError("Order must have a venue");
    }
    if (this.props.items.length === 0) {
      throw new ValidationError("Order must have at least one item");
    }
    for (const item of this.props.items) {
      if (item.quantity <= 0) {
        throw new ValidationError("Order item quantity must be positive");
      }
    }
  }

  get id(): string {
    return this.props.id;
  }

  get venueId(): string {
    return this.props.venueId;
  }

  get tableId(): string | undefined {
    return this.props.tableId;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get items(): OrderItem[] {
    return [...this.props.items];
  }

  get deviceId(): string | undefined {
    return this.props.deviceId;
  }

  get pax(): number | undefined {
    return this.props.pax;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get total(): Money {
    return this.props.items.reduce((sum, item) => {
      const itemTotal = item.unitPrice.multiply(item.quantity);
      return sum.add(itemTotal);
    }, Money.zero());
  }

  updateStatus(newStatus: OrderStatus): void {
    if (!this.props.status.canTransitionTo(newStatus)) {
      throw new ValidationError(
        `Cannot transition from ${this.props.status.toString()} to ${newStatus.toString()}`
      );
    }
    this.props.status = newStatus;
    this.props.updatedAt = new Date();
  }

  cancel(): void {
    if (this.props.status.isFinal()) {
      throw new ValidationError("Cannot cancel a finalized order");
    }
    this.props.status = OrderStatus.cancelled();
    this.props.updatedAt = new Date();
  }

  addItem(item: Omit<OrderItem, "id">): void {
    if (this.props.status.isFinal()) {
      throw new ValidationError("Cannot add items to a finalized order");
    }
    this.props.items.push({
      id: crypto.randomUUID(),
      ...item,
    });
    this.props.updatedAt = new Date();
  }

  removeItem(itemId: string): void {
    if (this.props.status.isFinal()) {
      throw new ValidationError("Cannot remove items from a finalized order");
    }
    const index = this.props.items.findIndex((i) => i.id === itemId);
    if (index === -1) {
      throw new ValidationError(`Item ${itemId} not found in order`);
    }
    this.props.items.splice(index, 1);
    if (this.props.items.length === 0) {
      throw new ValidationError("Order must have at least one item");
    }
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.props.id,
      venueId: this.props.venueId,
      tableId: this.props.tableId,
      tableLabel: this.props.tableLabel,
      status: this.props.status.toString(),
      items: this.props.items.map((item) => ({
        ...item,
        unitPrice: item.unitPrice.toNumber(),
      })),
      deviceId: this.props.deviceId,
      pax: this.props.pax,
      notes: this.props.notes,
      total: this.total.toNumber(),
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}

