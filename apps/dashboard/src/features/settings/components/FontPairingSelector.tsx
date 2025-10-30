import React from "react";
import { FONT_PAIRINGS } from "@inkwave/types";
import type { FontPairing } from "@inkwave/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FontPairingSelectorProps {
  selectedFontId: string;
  onSelect: (fontId: string) => void;
}

export const FontPairingSelector: React.FC<FontPairingSelectorProps> = ({
  selectedFontId,
  onSelect,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Font Pairing</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose a font combination for headings and body text
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FONT_PAIRINGS.map((font) => (
          <Card
            key={font.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedFontId === font.id
                ? "ring-2 ring-primary"
                : "hover:border-primary/50"
            }`}
            onClick={() => onSelect(font.id)}
          >
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{font.name}</h4>
                {selectedFontId === font.id && (
                  <Badge variant="default">Selected</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {font.description}
              </p>
              
              {/* Font Preview */}
              <div className="space-y-2 pt-2 border-t">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Heading:</div>
                  <div 
                    className="text-lg font-semibold"
                    style={{ fontFamily: font.headingFont }}
                  >
                    The Quick Brown Fox
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Body:</div>
                  <div 
                    className="text-sm"
                    style={{ fontFamily: font.bodyFont }}
                  >
                    The quick brown fox jumps over the lazy dog
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

