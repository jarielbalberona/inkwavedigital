import { ValidationError } from "../../shared/errors/domain-error.js";

export interface ItemOptionValueProps {
  id: string;
  optionId: string;
  label: string;
  priceDelta: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ItemOptionValue {
  private constructor(private props: ItemOptionValueProps) {
    this.validate();
  }

  static create(data: Omit<ItemOptionValueProps, "id" | "createdAt" | "updatedAt">): ItemOptionValue {
    return new ItemOptionValue({
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: ItemOptionValueProps): ItemOptionValue {
    return new ItemOptionValue(props);
  }

  private validate(): void {
    if (!this.props.optionId) {
      throw new ValidationError("Option value must have an option ID");
    }
    if (!this.props.label || this.props.label.trim().length === 0) {
      throw new ValidationError("Option value must have a label");
    }
    if (typeof this.props.priceDelta !== "number" || isNaN(this.props.priceDelta)) {
      throw new ValidationError("Option value price delta must be a valid number");
    }
  }

  get id(): string {
    return this.props.id;
  }

  get optionId(): string {
    return this.props.optionId;
  }

  get label(): string {
    return this.props.label;
  }

  get priceDelta(): number {
    return this.props.priceDelta;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateLabel(label: string): void {
    if (!label || label.trim().length === 0) {
      throw new ValidationError("Option value label cannot be empty");
    }
    this.props.label = label.trim();
    this.props.updatedAt = new Date();
  }

  updatePriceDelta(priceDelta: number): void {
    if (typeof priceDelta !== "number" || isNaN(priceDelta)) {
      throw new ValidationError("Price delta must be a valid number");
    }
    this.props.priceDelta = priceDelta;
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.props.id,
      optionId: this.props.optionId,
      label: this.props.label,
      priceDelta: this.props.priceDelta,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}

