import { ValidationError } from "../../shared/errors/domain-error.js";

export interface ItemOptionProps {
  id: string;
  itemId: string;
  name: string;
  type: "select" | "multi";
  required: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ItemOption {
  private constructor(private props: ItemOptionProps) {
    this.validate();
  }

  static create(data: Omit<ItemOptionProps, "id" | "createdAt" | "updatedAt">): ItemOption {
    return new ItemOption({
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: ItemOptionProps): ItemOption {
    return new ItemOption(props);
  }

  private validate(): void {
    if (!this.props.itemId) {
      throw new ValidationError("Item option must have an item ID");
    }
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new ValidationError("Item option must have a name");
    }
    if (this.props.type !== "select" && this.props.type !== "multi") {
      throw new ValidationError("Item option type must be 'select' or 'multi'");
    }
  }

  get id(): string {
    return this.props.id;
  }

  get itemId(): string {
    return this.props.itemId;
  }

  get name(): string {
    return this.props.name;
  }

  get type(): "select" | "multi" {
    return this.props.type;
  }

  get required(): boolean {
    return this.props.required;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError("Option name cannot be empty");
    }
    this.props.name = name.trim();
    this.props.updatedAt = new Date();
  }

  updateType(type: "select" | "multi"): void {
    if (type !== "select" && type !== "multi") {
      throw new ValidationError("Option type must be 'select' or 'multi'");
    }
    this.props.type = type;
    this.props.updatedAt = new Date();
  }

  toggleRequired(): void {
    this.props.required = !this.props.required;
    this.props.updatedAt = new Date();
  }

  setRequired(required: boolean): void {
    this.props.required = required;
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.props.id,
      itemId: this.props.itemId,
      name: this.props.name,
      type: this.props.type,
      required: this.props.required,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}

