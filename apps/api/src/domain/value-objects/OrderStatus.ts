import { ValidationError } from "../../shared/errors/domain-error.js";

export enum OrderStatusEnum {
  NEW = "NEW",
  PREPARING = "PREPARING",
  READY = "READY",
  SERVED = "SERVED",
  CANCELLED = "CANCELLED",
}

export class OrderStatus {
  private constructor(public readonly value: OrderStatusEnum) {}

  static new(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.NEW);
  }

  static preparing(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.PREPARING);
  }

  static ready(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.READY);
  }

  static served(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.SERVED);
  }

  static cancelled(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.CANCELLED);
  }

  static fromString(status: string): OrderStatus {
    const statusEnum = OrderStatusEnum[status as keyof typeof OrderStatusEnum];
    if (!statusEnum) {
      throw new ValidationError(`Invalid order status: ${status}`);
    }
    return new OrderStatus(statusEnum);
  }

  canTransitionTo(newStatus: OrderStatus): boolean {
    const transitions: Record<OrderStatusEnum, OrderStatusEnum[]> = {
      [OrderStatusEnum.NEW]: [OrderStatusEnum.PREPARING, OrderStatusEnum.CANCELLED],
      [OrderStatusEnum.PREPARING]: [OrderStatusEnum.READY, OrderStatusEnum.CANCELLED],
      [OrderStatusEnum.READY]: [OrderStatusEnum.SERVED, OrderStatusEnum.CANCELLED],
      [OrderStatusEnum.SERVED]: [],
      [OrderStatusEnum.CANCELLED]: [],
    };

    return transitions[this.value].includes(newStatus.value);
  }

  equals(other: OrderStatus): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  isNew(): boolean {
    return this.value === OrderStatusEnum.NEW;
  }

  isPreparing(): boolean {
    return this.value === OrderStatusEnum.PREPARING;
  }

  isReady(): boolean {
    return this.value === OrderStatusEnum.READY;
  }

  isServed(): boolean {
    return this.value === OrderStatusEnum.SERVED;
  }

  isCancelled(): boolean {
    return this.value === OrderStatusEnum.CANCELLED;
  }

  isFinal(): boolean {
    return this.isServed() || this.isCancelled();
  }
}

