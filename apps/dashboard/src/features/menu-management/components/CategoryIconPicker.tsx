import React, { useState } from "react";
import { ImagePicker } from "../../image-library/components/ImagePicker";

const PREDEFINED_ICONS = [
  { label: "Coffee", value: "☕" },
  { label: "Food", value: "🍽️" },
  { label: "Drinks", value: "🥤" },
  { label: "Dessert", value: "🍰" },
  { label: "Breakfast", value: "🥐" },
  { label: "Lunch", value: "🍱" },
  { label: "Dinner", value: "🍖" },
  { label: "Pizza", value: "🍕" },
  { label: "Burger", value: "🍔" },
  { label: "Pasta", value: "🍝" },
  { label: "Salad", value: "🥗" },
  { label: "Soup", value: "🍲" },
  { label: "Sandwich", value: "🥪" },
  { label: "Sushi", value: "🍣" },
  { label: "Ice Cream", value: "🍦" },
  { label: "Cake", value: "🎂" },
  { label: "Beer", value: "🍺" },
  { label: "Wine", value: "🍷" },
  { label: "Cocktail", value: "🍹" },
  { label: "Tea", value: "🍵" },
  { label: "Juice", value: "🧃" },
  { label: "Smoothie", value: "🥤" },
  { label: "Fruit", value: "🍎" },
  { label: "Vegetables", value: "🥕" },
];

interface CategoryIconPickerProps {
  value?: string;
  onChange: (value: string) => void;
}

export const CategoryIconPicker: React.FC<CategoryIconPickerProps> = ({ value, onChange }) => {
  const isUrl = value && value.startsWith("http");
  const [mode, setMode] = useState<"predefined" | "custom">(
    isUrl ? "custom" : "predefined"
  );

  return (
    <div>
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setMode("predefined")}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            mode === "predefined"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Predefined Icons
        </button>
        <button
          type="button"
          onClick={() => setMode("custom")}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            mode === "custom"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Custom Image
        </button>
      </div>

      {/* Content */}
      {mode === "predefined" ? (
        <div>
          {/* Current Selection Preview */}
          {value && !isUrl && (
            <div className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{value}</span>
                <span className="text-sm text-gray-600">Current selection</span>
              </div>
            </div>
          )}

          {/* Icon Grid */}
          <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-md">
            {PREDEFINED_ICONS.map((icon) => (
              <button
                key={icon.value}
                type="button"
                onClick={() => onChange(icon.value)}
                className={`p-3 border rounded-md text-2xl transition-all hover:scale-110 ${
                  value === icon.value
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                title={icon.label}
              >
                {icon.value}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <ImagePicker value={value} onChange={onChange} type="icon" />
      )}
    </div>
  );
};

