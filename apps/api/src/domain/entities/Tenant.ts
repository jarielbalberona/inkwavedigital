import { ValidationError } from "../../shared/errors/domain-error.js";

export interface TenantProps {
  id: string;
  name: string;
  slug: string;
  settingsJson: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Tenant {
  private constructor(private props: TenantProps) {
    this.validate();
  }

  static create(data: Omit<TenantProps, "id" | "createdAt" | "updatedAt">): Tenant {
    return new Tenant({
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: TenantProps): Tenant {
    return new Tenant(props);
  }

  private validate(): void {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new ValidationError("Tenant must have a name");
    }
    if (!this.props.slug || this.props.slug.trim().length === 0) {
      throw new ValidationError("Tenant must have a slug");
    }
    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(this.props.slug)) {
      throw new ValidationError("Tenant slug must contain only lowercase letters, numbers, and hyphens");
    }
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get slug(): string {
    return this.props.slug;
  }

  get settingsJson(): Record<string, any> | null {
    return this.props.settingsJson;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError("Tenant name cannot be empty");
    }
    this.props.name = name.trim();
    this.props.updatedAt = new Date();
  }

  updateSettings(settings: Record<string, any>): void {
    this.props.settingsJson = settings;
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.props.id,
      name: this.props.name,
      slug: this.props.slug,
      settings: this.props.settingsJson,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}

