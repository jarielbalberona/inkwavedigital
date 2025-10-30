import { z } from "zod";

// Health Check Response
export const HealthCheckResponseSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.string(),
});

export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;

// API Response Wrapper
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
  });

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Theme Configuration
export interface ColorTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    // Light mode
    light: {
      background: string;
      foreground: string;
      card: string;
      cardForeground: string;
      popover: string;
      popoverForeground: string;
      primary: string;
      primaryForeground: string;
      secondary: string;
      secondaryForeground: string;
      muted: string;
      mutedForeground: string;
      accent: string;
      accentForeground: string;
      destructive: string;
      border: string;
      input: string;
      ring: string;
    };
    // Dark mode
    dark: {
      background: string;
      foreground: string;
      card: string;
      cardForeground: string;
      popover: string;
      popoverForeground: string;
      primary: string;
      primaryForeground: string;
      secondary: string;
      secondaryForeground: string;
      muted: string;
      mutedForeground: string;
      accent: string;
      accentForeground: string;
      destructive: string;
      border: string;
      input: string;
      ring: string;
    };
  };
}

export interface FontPairing {
  id: string;
  name: string;
  description: string;
  headingFont: string;
  bodyFont: string;
  googleFontsUrl: string;
}

export interface TenantSettings {
  theme?: {
    colorThemeId: string;
    fontPairingId: string;
  };
}

// Predefined Color Themes
export const COLOR_THEMES: ColorTheme[] = [
  {
    id: "default",
    name: "Default",
    description: "Clean and professional neutral theme",
    colors: {
      light: {
        background: "oklch(1 0 0)",
        foreground: "oklch(0.145 0 0)",
        card: "oklch(1 0 0)",
        cardForeground: "oklch(0.145 0 0)",
        popover: "oklch(1 0 0)",
        popoverForeground: "oklch(0.145 0 0)",
        primary: "oklch(0.205 0 0)",
        primaryForeground: "oklch(0.985 0 0)",
        secondary: "oklch(0.97 0 0)",
        secondaryForeground: "oklch(0.205 0 0)",
        muted: "oklch(0.97 0 0)",
        mutedForeground: "oklch(0.556 0 0)",
        accent: "oklch(0.97 0 0)",
        accentForeground: "oklch(0.205 0 0)",
        destructive: "oklch(0.577 0.245 27.325)",
        border: "oklch(0.922 0 0)",
        input: "oklch(0.922 0 0)",
        ring: "oklch(0.708 0 0)",
      },
      dark: {
        background: "oklch(0.145 0 0)",
        foreground: "oklch(0.985 0 0)",
        card: "oklch(0.205 0 0)",
        cardForeground: "oklch(0.985 0 0)",
        popover: "oklch(0.205 0 0)",
        popoverForeground: "oklch(0.985 0 0)",
        primary: "oklch(0.922 0 0)",
        primaryForeground: "oklch(0.205 0 0)",
        secondary: "oklch(0.269 0 0)",
        secondaryForeground: "oklch(0.985 0 0)",
        muted: "oklch(0.269 0 0)",
        mutedForeground: "oklch(0.708 0 0)",
        accent: "oklch(0.269 0 0)",
        accentForeground: "oklch(0.985 0 0)",
        destructive: "oklch(0.704 0.191 22.216)",
        border: "oklch(1 0 0 / 10%)",
        input: "oklch(1 0 0 / 15%)",
        ring: "oklch(0.556 0 0)",
      },
    },
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    description: "Cool and calming blue tones",
    colors: {
      light: {
        background: "oklch(0.99 0.005 240)",
        foreground: "oklch(0.15 0.02 250)",
        card: "oklch(1 0 0)",
        cardForeground: "oklch(0.15 0.02 250)",
        popover: "oklch(1 0 0)",
        popoverForeground: "oklch(0.15 0.02 250)",
        primary: "oklch(0.55 0.18 245)",
        primaryForeground: "oklch(0.99 0.005 240)",
        secondary: "oklch(0.90 0.03 240)",
        secondaryForeground: "oklch(0.20 0.05 250)",
        muted: "oklch(0.95 0.01 240)",
        mutedForeground: "oklch(0.50 0.05 250)",
        accent: "oklch(0.88 0.10 220)",
        accentForeground: "oklch(0.20 0.05 250)",
        destructive: "oklch(0.577 0.245 27.325)",
        border: "oklch(0.88 0.02 240)",
        input: "oklch(0.88 0.02 240)",
        ring: "oklch(0.55 0.18 245)",
      },
      dark: {
        background: "oklch(0.15 0.02 250)",
        foreground: "oklch(0.95 0.01 240)",
        card: "oklch(0.20 0.03 245)",
        cardForeground: "oklch(0.95 0.01 240)",
        popover: "oklch(0.20 0.03 245)",
        popoverForeground: "oklch(0.95 0.01 240)",
        primary: "oklch(0.65 0.20 240)",
        primaryForeground: "oklch(0.10 0.02 250)",
        secondary: "oklch(0.25 0.04 245)",
        secondaryForeground: "oklch(0.95 0.01 240)",
        muted: "oklch(0.25 0.04 245)",
        mutedForeground: "oklch(0.70 0.03 240)",
        accent: "oklch(0.35 0.08 230)",
        accentForeground: "oklch(0.95 0.01 240)",
        destructive: "oklch(0.704 0.191 22.216)",
        border: "oklch(0.30 0.04 245)",
        input: "oklch(0.30 0.04 245)",
        ring: "oklch(0.65 0.20 240)",
      },
    },
  },
  {
    id: "forest-green",
    name: "Forest Green",
    description: "Natural and organic green tones",
    colors: {
      light: {
        background: "oklch(0.99 0.005 140)",
        foreground: "oklch(0.15 0.02 150)",
        card: "oklch(1 0 0)",
        cardForeground: "oklch(0.15 0.02 150)",
        popover: "oklch(1 0 0)",
        popoverForeground: "oklch(0.15 0.02 150)",
        primary: "oklch(0.50 0.15 155)",
        primaryForeground: "oklch(0.99 0.005 140)",
        secondary: "oklch(0.92 0.03 145)",
        secondaryForeground: "oklch(0.20 0.05 150)",
        muted: "oklch(0.95 0.01 140)",
        mutedForeground: "oklch(0.48 0.05 150)",
        accent: "oklch(0.85 0.10 135)",
        accentForeground: "oklch(0.20 0.05 150)",
        destructive: "oklch(0.577 0.245 27.325)",
        border: "oklch(0.88 0.02 140)",
        input: "oklch(0.88 0.02 140)",
        ring: "oklch(0.50 0.15 155)",
      },
      dark: {
        background: "oklch(0.15 0.02 150)",
        foreground: "oklch(0.95 0.01 140)",
        card: "oklch(0.20 0.03 145)",
        cardForeground: "oklch(0.95 0.01 140)",
        popover: "oklch(0.20 0.03 145)",
        popoverForeground: "oklch(0.95 0.01 140)",
        primary: "oklch(0.65 0.18 150)",
        primaryForeground: "oklch(0.10 0.02 150)",
        secondary: "oklch(0.25 0.04 145)",
        secondaryForeground: "oklch(0.95 0.01 140)",
        muted: "oklch(0.25 0.04 145)",
        mutedForeground: "oklch(0.68 0.03 140)",
        accent: "oklch(0.38 0.08 140)",
        accentForeground: "oklch(0.95 0.01 140)",
        destructive: "oklch(0.704 0.191 22.216)",
        border: "oklch(0.30 0.04 145)",
        input: "oklch(0.30 0.04 145)",
        ring: "oklch(0.65 0.18 150)",
      },
    },
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    description: "Warm and energetic orange tones",
    colors: {
      light: {
        background: "oklch(0.99 0.005 60)",
        foreground: "oklch(0.15 0.02 40)",
        card: "oklch(1 0 0)",
        cardForeground: "oklch(0.15 0.02 40)",
        popover: "oklch(1 0 0)",
        popoverForeground: "oklch(0.15 0.02 40)",
        primary: "oklch(0.60 0.20 45)",
        primaryForeground: "oklch(0.99 0.005 60)",
        secondary: "oklch(0.92 0.04 50)",
        secondaryForeground: "oklch(0.20 0.05 40)",
        muted: "oklch(0.95 0.01 50)",
        mutedForeground: "oklch(0.48 0.05 40)",
        accent: "oklch(0.88 0.12 55)",
        accentForeground: "oklch(0.20 0.05 40)",
        destructive: "oklch(0.577 0.245 27.325)",
        border: "oklch(0.88 0.02 50)",
        input: "oklch(0.88 0.02 50)",
        ring: "oklch(0.60 0.20 45)",
      },
      dark: {
        background: "oklch(0.15 0.02 40)",
        foreground: "oklch(0.95 0.01 50)",
        card: "oklch(0.20 0.03 45)",
        cardForeground: "oklch(0.95 0.01 50)",
        popover: "oklch(0.20 0.03 45)",
        popoverForeground: "oklch(0.95 0.01 50)",
        primary: "oklch(0.70 0.22 50)",
        primaryForeground: "oklch(0.10 0.02 40)",
        secondary: "oklch(0.25 0.04 45)",
        secondaryForeground: "oklch(0.95 0.01 50)",
        muted: "oklch(0.25 0.04 45)",
        mutedForeground: "oklch(0.68 0.03 50)",
        accent: "oklch(0.40 0.10 55)",
        accentForeground: "oklch(0.95 0.01 50)",
        destructive: "oklch(0.704 0.191 22.216)",
        border: "oklch(0.30 0.04 45)",
        input: "oklch(0.30 0.04 45)",
        ring: "oklch(0.70 0.22 50)",
      },
    },
  },
  {
    id: "purple-haze",
    name: "Purple Haze",
    description: "Rich and sophisticated purple tones",
    colors: {
      light: {
        background: "oklch(0.99 0.005 300)",
        foreground: "oklch(0.15 0.02 290)",
        card: "oklch(1 0 0)",
        cardForeground: "oklch(0.15 0.02 290)",
        popover: "oklch(1 0 0)",
        popoverForeground: "oklch(0.15 0.02 290)",
        primary: "oklch(0.50 0.20 290)",
        primaryForeground: "oklch(0.99 0.005 300)",
        secondary: "oklch(0.92 0.04 295)",
        secondaryForeground: "oklch(0.20 0.05 290)",
        muted: "oklch(0.95 0.01 295)",
        mutedForeground: "oklch(0.48 0.05 290)",
        accent: "oklch(0.85 0.12 280)",
        accentForeground: "oklch(0.20 0.05 290)",
        destructive: "oklch(0.577 0.245 27.325)",
        border: "oklch(0.88 0.02 295)",
        input: "oklch(0.88 0.02 295)",
        ring: "oklch(0.50 0.20 290)",
      },
      dark: {
        background: "oklch(0.15 0.02 290)",
        foreground: "oklch(0.95 0.01 295)",
        card: "oklch(0.20 0.03 290)",
        cardForeground: "oklch(0.95 0.01 295)",
        popover: "oklch(0.20 0.03 290)",
        popoverForeground: "oklch(0.95 0.01 295)",
        primary: "oklch(0.65 0.22 295)",
        primaryForeground: "oklch(0.10 0.02 290)",
        secondary: "oklch(0.25 0.04 290)",
        secondaryForeground: "oklch(0.95 0.01 295)",
        muted: "oklch(0.25 0.04 290)",
        mutedForeground: "oklch(0.68 0.03 295)",
        accent: "oklch(0.38 0.10 285)",
        accentForeground: "oklch(0.95 0.01 295)",
        destructive: "oklch(0.704 0.191 22.216)",
        border: "oklch(0.30 0.04 290)",
        input: "oklch(0.30 0.04 290)",
        ring: "oklch(0.65 0.22 295)",
      },
    },
  },
  {
    id: "monochrome",
    name: "Monochrome",
    description: "Elegant black and white theme",
    colors: {
      light: {
        background: "oklch(1 0 0)",
        foreground: "oklch(0.10 0 0)",
        card: "oklch(0.98 0 0)",
        cardForeground: "oklch(0.10 0 0)",
        popover: "oklch(1 0 0)",
        popoverForeground: "oklch(0.10 0 0)",
        primary: "oklch(0.15 0 0)",
        primaryForeground: "oklch(0.98 0 0)",
        secondary: "oklch(0.92 0 0)",
        secondaryForeground: "oklch(0.15 0 0)",
        muted: "oklch(0.94 0 0)",
        mutedForeground: "oklch(0.45 0 0)",
        accent: "oklch(0.88 0 0)",
        accentForeground: "oklch(0.15 0 0)",
        destructive: "oklch(0.577 0.245 27.325)",
        border: "oklch(0.85 0 0)",
        input: "oklch(0.85 0 0)",
        ring: "oklch(0.40 0 0)",
      },
      dark: {
        background: "oklch(0.12 0 0)",
        foreground: "oklch(0.98 0 0)",
        card: "oklch(0.18 0 0)",
        cardForeground: "oklch(0.98 0 0)",
        popover: "oklch(0.18 0 0)",
        popoverForeground: "oklch(0.98 0 0)",
        primary: "oklch(0.90 0 0)",
        primaryForeground: "oklch(0.12 0 0)",
        secondary: "oklch(0.25 0 0)",
        secondaryForeground: "oklch(0.98 0 0)",
        muted: "oklch(0.25 0 0)",
        mutedForeground: "oklch(0.65 0 0)",
        accent: "oklch(0.30 0 0)",
        accentForeground: "oklch(0.98 0 0)",
        destructive: "oklch(0.704 0.191 22.216)",
        border: "oklch(0.28 0 0)",
        input: "oklch(0.28 0 0)",
        ring: "oklch(0.60 0 0)",
      },
    },
  },
];

// Predefined Font Pairings
export const FONT_PAIRINGS: FontPairing[] = [
  {
    id: "inter-roboto",
    name: "Modern Sans",
    description: "Inter for headings, Roboto for body text",
    headingFont: "'Inter', sans-serif",
    bodyFont: "'Roboto', sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@300;400;500&display=swap",
  },
  {
    id: "playfair-source",
    name: "Classic Elegance",
    description: "Playfair Display for headings, Source Sans for body",
    headingFont: "'Playfair Display', serif",
    bodyFont: "'Source Sans 3', sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+3:wght@300;400;600&display=swap",
  },
  {
    id: "montserrat-open",
    name: "Professional",
    description: "Montserrat for headings, Open Sans for body",
    headingFont: "'Montserrat', sans-serif",
    bodyFont: "'Open Sans', sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Open+Sans:wght@300;400;600&display=swap",
  },
  {
    id: "poppins-lato",
    name: "Contemporary",
    description: "Poppins for headings, Lato for body",
    headingFont: "'Poppins', sans-serif",
    bodyFont: "'Lato', sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Lato:wght@300;400;700&display=swap",
  },
  {
    id: "raleway-nunito",
    name: "Friendly Modern",
    description: "Raleway for headings, Nunito for body",
    headingFont: "'Raleway', sans-serif",
    bodyFont: "'Nunito', sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700&family=Nunito:wght@300;400;600&display=swap",
  },
  {
    id: "merriweather-lato",
    name: "Classic Serif",
    description: "Merriweather for headings, Lato for body",
    headingFont: "'Merriweather', serif",
    bodyFont: "'Lato', sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&family=Lato:wght@300;400;700&display=swap",
  },
];

