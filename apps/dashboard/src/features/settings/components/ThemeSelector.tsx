import React from "react";
import { COLOR_THEMES } from "@inkwave/types";
import type { ColorTheme } from "@inkwave/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ThemeSelectorProps {
  selectedThemeId: string;
  onSelect: (themeId: string) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedThemeId,
  onSelect,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Color Theme</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose a color theme for your customer-facing menu and dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {COLOR_THEMES.map((theme) => (
          <Card
            key={theme.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedThemeId === theme.id
                ? "ring-2 ring-primary"
                : "hover:border-primary/50"
            }`}
            onClick={() => onSelect(theme.id)}
          >
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{theme.name}</h4>
                {selectedThemeId === theme.id && (
                  <Badge variant="default">Selected</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {theme.description}
              </p>
              
              {/* Color Preview */}
              <div className="space-y-2">
                <div className="text-xs font-medium">Preview:</div>
                <div className="flex gap-2">
                  <div
                    className="w-12 h-12 rounded-md border"
                    style={{ background: theme.colors.light.primary }}
                    title="Primary"
                  />
                  <div
                    className="w-12 h-12 rounded-md border"
                    style={{ background: theme.colors.light.secondary }}
                    title="Secondary"
                  />
                  <div
                    className="w-12 h-12 rounded-md border"
                    style={{ background: theme.colors.light.accent }}
                    title="Accent"
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

