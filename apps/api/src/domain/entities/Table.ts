import { ValidationError } from "../../shared/errors/domain-error.js";

export interface TableProps {
  id: string;
  venueId: string;
  tableNumber: number;
  name?: string;
  label: string;
  description?: string;
  capacity?: number;
  qrCode?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Table {
  private constructor(private props: TableProps) {
    this.validate();
  }

  static create(data: Omit<TableProps, "id" | "createdAt" | "updatedAt">): Table {
    return new Table({
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: TableProps): Table {
    return new Table(props);
  }

  private validate(): void {
    if (!this.props.venueId) {
      throw new ValidationError("Table must have a venue");
    }
    if (!this.props.label || this.props.label.trim().length === 0) {
      throw new ValidationError("Table must have a label");
    }
    if (typeof this.props.tableNumber !== 'number' || this.props.tableNumber < 1) {
      throw new ValidationError("Table number must be a positive integer");
    }
    if (this.props.capacity !== undefined && (this.props.capacity < 1 || this.props.capacity > 100)) {
      throw new ValidationError("Table capacity must be between 1 and 100");
    }
  }

  get id(): string {
    return this.props.id;
  }

  get venueId(): string {
    return this.props.venueId;
  }

  get tableNumber(): number {
    return this.props.tableNumber;
  }

  get name(): string | undefined {
    return this.props.name;
  }

  get label(): string {
    return this.props.label;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get capacity(): number | undefined {
    return this.props.capacity;
  }

  get qrCode(): string | undefined {
    return this.props.qrCode;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateLabel(label: string): void {
    if (!label || label.trim().length === 0) {
      throw new ValidationError("Table label cannot be empty");
    }
    this.props.label = label.trim();
    this.props.updatedAt = new Date();
  }

  updateTableNumber(tableNumber: number): void {
    if (typeof tableNumber !== 'number' || tableNumber < 1) {
      throw new ValidationError("Table number must be a positive integer");
    }
    this.props.tableNumber = tableNumber;
    this.props.updatedAt = new Date();
  }

  updateName(name?: string): void {
    this.props.name = name?.trim() || undefined;
    this.props.updatedAt = new Date();
  }

  updateDescription(description?: string): void {
    this.props.description = description?.trim() || undefined;
    this.props.updatedAt = new Date();
  }

  updateCapacity(capacity?: number): void {
    if (capacity !== undefined && (capacity < 1 || capacity > 100)) {
      throw new ValidationError("Table capacity must be between 1 and 100");
    }
    this.props.capacity = capacity;
    this.props.updatedAt = new Date();
  }

  updateQRCode(qrCode: string): void {
    this.props.qrCode = qrCode;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.props.id,
      venueId: this.props.venueId,
      tableNumber: this.props.tableNumber,
      name: this.props.name,
      label: this.props.label,
      description: this.props.description,
      capacity: this.props.capacity,
      qrCode: this.props.qrCode,
      isActive: this.props.isActive,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}
