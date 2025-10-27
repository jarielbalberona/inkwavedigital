import { ValidationError } from "../../shared/errors/domain-error.js";

export interface MenuCategoryProps {
  id: string;
  menuId: string;
  name: string;
  sortIndex: number;
  iconUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class MenuCategory {
  private constructor(private props: MenuCategoryProps) {
    this.validate();
  }

  static create(data: Omit<MenuCategoryProps, "id" | "createdAt" | "updatedAt">): MenuCategory {
    return new MenuCategory({
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: MenuCategoryProps): MenuCategory {
    return new MenuCategory(props);
  }

  private validate(): void {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new ValidationError("Category name is required");
    }
    if (this.props.sortIndex < 0) {
      throw new ValidationError("Sort index must be non-negative");
    }
  }

  get id(): string {
    return this.props.id;
  }

  get menuId(): string {
    return this.props.menuId;
  }

  get name(): string {
    return this.props.name;
  }

  get sortIndex(): number {
    return this.props.sortIndex;
  }

  get iconUrl(): string | undefined {
    return this.props.iconUrl;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError("Category name cannot be empty");
    }
    this.props.name = name.trim();
    this.props.updatedAt = new Date();
  }

  updateSortIndex(sortIndex: number): void {
    if (sortIndex < 0) {
      throw new ValidationError("Sort index must be non-negative");
    }
    this.props.sortIndex = sortIndex;
    this.props.updatedAt = new Date();
  }

  updateIconUrl(iconUrl: string | undefined): void {
    this.props.iconUrl = iconUrl;
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.props.id,
      menuId: this.props.menuId,
      name: this.props.name,
      sortIndex: this.props.sortIndex,
      iconUrl: this.props.iconUrl,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}
