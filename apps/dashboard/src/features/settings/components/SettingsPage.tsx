import React, { useState, useEffect } from "react";
import { useTenantId } from "@/hooks/useTenantId";
import { useTenantInfo } from "@/hooks/useTenantInfo";
import { useUpdateSettings } from "../hooks/useUpdateSettings";
import { ThemeSelector } from "./ThemeSelector";
import { FontPairingSelector } from "./FontPairingSelector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { COLOR_THEMES, FONT_PAIRINGS } from "@inkwave/types";
import type { TenantSettings } from "@inkwave/types";
import { applyTenantTheme } from "@/lib/themeLoader";

export const SettingsPage: React.FC = () => {
  const { tenantId } = useTenantId();
  const { tenantInfo } = useTenantInfo();
  const updateSettings = useUpdateSettings();

  // Default to first theme and font if none selected
  const [selectedTheme, setSelectedTheme] = useState(COLOR_THEMES[0].id);
  const [selectedFont, setSelectedFont] = useState(FONT_PAIRINGS[0].id);
  const [hasChanges, setHasChanges] = useState(false);

  // Load current settings from tenant info
  useEffect(() => {
    if (tenantInfo?.settings?.theme) {
      setSelectedTheme(tenantInfo.settings.theme.colorThemeId);
      setSelectedFont(tenantInfo.settings.theme.fontPairingId);
    }
  }, [tenantInfo]);

  const handleSave = async () => {
    if (!tenantId) return;

    const settings: TenantSettings = {
      theme: {
        colorThemeId: selectedTheme,
        fontPairingId: selectedFont,
      },
    };

    try {
      await updateSettings.mutateAsync({
        tenantId,
        settings,
      });
      setHasChanges(false);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings. Please try again.");
    }
  };

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    setHasChanges(true);
    // Apply preview immediately
    applyTenantTheme({
      theme: {
        colorThemeId: themeId,
        fontPairingId: selectedFont,
      },
    });
  };

  const handleFontChange = (fontId: string) => {
    setSelectedFont(fontId);
    setHasChanges(true);
    // Apply preview immediately
    applyTenantTheme({
      theme: {
        colorThemeId: selectedTheme,
        fontPairingId: fontId,
      },
    });
  };

  if (!tenantId) {
    return (
      <div className="p-6">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tenant Settings</h1>
        <p className="text-muted-foreground mt-2">
          Customize the appearance of your customer-facing menu and dashboard
        </p>
      </div>

      <Separator />

      <Card className="p-6">
        <ThemeSelector
          selectedThemeId={selectedTheme}
          onSelect={handleThemeChange}
        />
      </Card>

      <Card className="p-6">
        <FontPairingSelector
          selectedFontId={selectedFont}
          onSelect={handleFontChange}
        />
      </Card>

      <div className="flex justify-end gap-4 sticky bottom-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border rounded-lg shadow-lg">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          disabled={!hasChanges}
        >
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || updateSettings.isPending}
        >
          {updateSettings.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

