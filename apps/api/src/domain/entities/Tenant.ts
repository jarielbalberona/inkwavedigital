import { ValidationError } from "../../shared/errors/domain-error.js";
import type { TenantSettings } from "@inkwave/types";
import { COLOR_THEMES, FONT_PAIRINGS } from "@inkwave/types";

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

  updateSlug(slug: string): void {
    if (!slug || slug.trim().length === 0) {
      throw new ValidationError("Tenant slug cannot be empty");
    }
    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new ValidationError("Tenant slug must contain only lowercase letters, numbers, and hyphens");
    }
    this.props.slug = slug.trim();
    this.props.updatedAt = new Date();
  }

  updateSettings(settings: Record<string, any>): void {
    this.validateSettings(settings);
    this.props.settingsJson = settings;
    this.props.updatedAt = new Date();
  }

  private validateSettings(settings: Record<string, any>): void {
    // If theme settings exist, validate them
    if (settings.theme) {
      const themeSettings = settings.theme as TenantSettings["theme"];
      
      if (themeSettings.colorThemeId) {
        const validTheme = COLOR_THEMES.find(t => t.id === themeSettings.colorThemeId);
        if (!validTheme) {
          throw new ValidationError(`Invalid color theme ID: ${themeSettings.colorThemeId}`);
        }
      }
      
      if (themeSettings.fontPairingId) {
        const validFont = FONT_PAIRINGS.find(f => f.id === themeSettings.fontPairingId);
        if (!validFont) {
          throw new ValidationError(`Invalid font pairing ID: ${themeSettings.fontPairingId}`);
        }
      }
    }
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

