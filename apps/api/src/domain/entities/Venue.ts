import { ValidationError } from "../../shared/errors/domain-error.js";

export interface VenueProps {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  address?: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Venue {
  private constructor(private props: VenueProps) {
    this.validate();
  }

  static create(data: Omit<VenueProps, "id" | "createdAt" | "updatedAt">): Venue {
    return new Venue({
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: VenueProps): Venue {
    return new Venue(props);
  }

  private validate(): void {
    if (!this.props.tenantId) {
      throw new ValidationError("Venue must have a tenant");
    }
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new ValidationError("Venue must have a name");
    }
    if (!this.props.slug || this.props.slug.trim().length === 0) {
      throw new ValidationError("Venue must have a slug");
    }
  }

  get id(): string {
    return this.props.id;
  }

  get tenantId(): string {
    return this.props.tenantId;
  }

  get name(): string {
    return this.props.name;
  }

  get slug(): string {
    return this.props.slug;
  }

  get address(): string | undefined {
    return this.props.address;
  }

  get timezone(): string {
    return this.props.timezone;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError("Venue name cannot be empty");
    }
    this.props.name = name.trim();
    this.props.updatedAt = new Date();
  }

  updateAddress(address: string): void {
    this.props.address = address;
    this.props.updatedAt = new Date();
  }

  updateTimezone(timezone: string): void {
    if (!timezone) {
      throw new ValidationError("Timezone cannot be empty");
    }
    this.props.timezone = timezone;
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.props.id,
      tenantId: this.props.tenantId,
      name: this.props.name,
      slug: this.props.slug,
      address: this.props.address,
      timezone: this.props.timezone,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}

