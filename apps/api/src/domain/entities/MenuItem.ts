import { ValidationError } from "../../shared/errors/domain-error.js";
import { Money } from "../value-objects/Money.js";

export interface MenuItemOption {
  id: string;
  name: string;
  type: "select" | "multi";
  required: boolean;
  values: MenuItemOptionValue[];
}

export interface MenuItemOptionValue {
  id: string;
  label: string;
  priceDelta: Money;
}

export interface MenuItemProps {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: Money;
  imageUrl?: string;
  isAvailable: boolean;
  options: MenuItemOption[];
  createdAt: Date;
  updatedAt: Date;
}

export class MenuItem {
  private constructor(private props: MenuItemProps) {
    this.validate();
  }

  static create(data: Omit<MenuItemProps, "id" | "createdAt" | "updatedAt">): MenuItem {
    return new MenuItem({
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: MenuItemProps): MenuItem {
    return new MenuItem(props);
  }

  private validate(): void {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new ValidationError("Menu item must have a name");
    }
    if (!this.props.categoryId) {
      throw new ValidationError("Menu item must have a category");
    }
    if (this.props.price.toNumber() <= 0) {
      throw new ValidationError("Menu item price must be positive");
    }
  }

  get id(): string {
    return this.props.id;
  }

  get categoryId(): string {
    return this.props.categoryId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get price(): Money {
    return this.props.price;
  }

  get imageUrl(): string | undefined {
    return this.props.imageUrl;
  }

  get isAvailable(): boolean {
    return this.props.isAvailable;
  }

  get options(): MenuItemOption[] {
    return [...this.props.options];
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError("Menu item name cannot be empty");
    }
    this.props.name = name.trim();
    this.props.updatedAt = new Date();
  }

  updateDescription(description: string): void {
    this.props.description = description;
    this.props.updatedAt = new Date();
  }

  updatePrice(price: Money): void {
    if (price.toNumber() <= 0) {
      throw new ValidationError("Menu item price must be positive");
    }
    this.props.price = price;
    this.props.updatedAt = new Date();
  }

  updateImageUrl(imageUrl: string): void {
    this.props.imageUrl = imageUrl;
    this.props.updatedAt = new Date();
  }

  setAvailability(isAvailable: boolean): void {
    this.props.isAvailable = isAvailable;
    this.props.updatedAt = new Date();
  }

  addOption(option: Omit<MenuItemOption, "id">): void {
    this.props.options.push({
      id: crypto.randomUUID(),
      ...option,
    });
    this.props.updatedAt = new Date();
  }

  removeOption(optionId: string): void {
    const index = this.props.options.findIndex((o) => o.id === optionId);
    if (index === -1) {
      throw new ValidationError(`Option ${optionId} not found`);
    }
    this.props.options.splice(index, 1);
    this.props.updatedAt = new Date();
  }

  calculatePriceWithOptions(selectedOptions: Record<string, string[]>): Money {
    let totalPrice = this.props.price;

    for (const option of this.props.options) {
      const selectedValues = selectedOptions[option.id] || [];
      for (const valueId of selectedValues) {
        const optionValue = option.values.find((v) => v.id === valueId);
        if (optionValue) {
          totalPrice = totalPrice.add(optionValue.priceDelta);
        }
      }
    }

    return totalPrice;
  }

  toJSON() {
    return {
      id: this.props.id,
      categoryId: this.props.categoryId,
      name: this.props.name,
      description: this.props.description,
      price: this.props.price.toNumber(),
      imageUrl: this.props.imageUrl,
      isAvailable: this.props.isAvailable,
      options: this.props.options.map((opt) => ({
        ...opt,
        values: opt.values.map((v) => ({
          ...v,
          priceDelta: v.priceDelta.toNumber(),
        })),
      })),
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}

