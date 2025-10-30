import { COLOR_THEMES, FONT_PAIRINGS } from "@inkwave/types";
import type { TenantSettings } from "@inkwave/types";

/**
 * Apply theme colors to the document root
 */
export function applyThemeColors(colorThemeId: string, isDarkMode: boolean = false): void {
  const theme = COLOR_THEMES.find(t => t.id === colorThemeId);
  if (!theme) {
    console.warn(`Theme with ID "${colorThemeId}" not found, using default theme`);
    return;
  }

  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  const root = document.documentElement;

  // Apply CSS custom properties
  root.style.setProperty('--background', colors.background);
  root.style.setProperty('--foreground', colors.foreground);
  root.style.setProperty('--card', colors.card);
  root.style.setProperty('--card-foreground', colors.cardForeground);
  root.style.setProperty('--popover', colors.popover);
  root.style.setProperty('--popover-foreground', colors.popoverForeground);
  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--primary-foreground', colors.primaryForeground);
  root.style.setProperty('--secondary', colors.secondary);
  root.style.setProperty('--secondary-foreground', colors.secondaryForeground);
  root.style.setProperty('--muted', colors.muted);
  root.style.setProperty('--muted-foreground', colors.mutedForeground);
  root.style.setProperty('--accent', colors.accent);
  root.style.setProperty('--accent-foreground', colors.accentForeground);
  root.style.setProperty('--destructive', colors.destructive);
  root.style.setProperty('--border', colors.border);
  root.style.setProperty('--input', colors.input);
  root.style.setProperty('--ring', colors.ring);
}

/**
 * Load and apply Google Fonts
 */
export function loadGoogleFonts(fontPairingId: string): void {
  const fontPairing = FONT_PAIRINGS.find(f => f.id === fontPairingId);
  if (!fontPairing) {
    console.warn(`Font pairing with ID "${fontPairingId}" not found`);
    return;
  }

  // Check if font link already exists
  const existingLink = document.getElementById('google-fonts-link');
  if (existingLink) {
    existingLink.remove();
  }

  // Create and append new font link
  const link = document.createElement('link');
  link.id = 'google-fonts-link';
  link.rel = 'stylesheet';
  link.href = fontPairing.googleFontsUrl;
  document.head.appendChild(link);

  // Apply fonts to body
  document.body.style.fontFamily = fontPairing.bodyFont;
  
  // Apply heading font to all heading elements
  const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  headingTags.forEach(tag => {
    const elements = document.getElementsByTagName(tag);
    Array.from(elements).forEach(element => {
      (element as HTMLElement).style.fontFamily = fontPairing.headingFont;
    });
  });
}

/**
 * Apply tenant theme settings
 */
export function applyTenantTheme(settings: TenantSettings | null | undefined, isDarkMode: boolean = false): void {
  if (!settings?.theme) {
    console.log('No theme settings found, using defaults');
    return;
  }

  const { colorThemeId, fontPairingId } = settings.theme;

  if (colorThemeId) {
    applyThemeColors(colorThemeId, isDarkMode);
  }

  if (fontPairingId) {
    loadGoogleFonts(fontPairingId);
  }
}

/**
 * Reset to default theme
 */
export function resetToDefaultTheme(): void {
  applyThemeColors('default', false);
  // Default fonts are already in CSS, so just remove custom font link
  const existingLink = document.getElementById('google-fonts-link');
  if (existingLink) {
    existingLink.remove();
  }
}

