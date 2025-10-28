import { ValidationError } from "../../shared/errors/domain-error.js";

export interface MenuProps {
  id: string;
  venueId: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Menu {
  private constructor(private props: MenuProps) {
    this.validate();
  }

  static create(data: Omit<MenuProps, "id" | "createdAt" | "updatedAt">): Menu {
    return new Menu({
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: MenuProps): Menu {
    return new Menu(props);
  }

  private validate(): void {
    if (!this.props.venueId) {
      throw new ValidationError("Menu must have a venue");
    }
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new ValidationError("Menu must have a name");
    }
  }

  get id(): string {
    return this.props.id;
  }

  get venueId(): string {
    return this.props.venueId;
  }

  get name(): string {
    return this.props.name;
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

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError("Menu name cannot be empty");
    }
    this.props.name = name.trim();
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
      name: this.props.name,
      isActive: this.props.isActive,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}

