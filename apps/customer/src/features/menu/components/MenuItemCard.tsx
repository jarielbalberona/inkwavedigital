import React, { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import type { MenuItem } from "../types/menu.types";
import { formatPrice, getItemTotalPrice } from "../hooks/helpers/menuHelpers";
import { useCartStore } from "../../cart/hooks/stores/useCartStore";

interface MenuItemCardProps {
  item: MenuItem;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [showOptions, setShowOptions] = useState(false);
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    if (item.options.length > 0 && !showOptions) {
      setShowOptions(true);
      return;
    }
    
    addItem(item, selectedOptions);
    setShowOptions(false);
    setSelectedOptions({});
  };

  const handleOptionChange = (optionId: string, valueId: string, isMulti: boolean) => {
    setSelectedOptions(prev => {
      const current = prev[optionId] || [];
      if (isMulti) {
        const newValues = current.includes(valueId)
          ? current.filter(id => id !== valueId)
          : [...current, valueId];
        return { ...prev, [optionId]: newValues };
      } else {
        return { ...prev, [optionId]: [valueId] };
      }
    });
  };

  const totalPrice = getItemTotalPrice(item, selectedOptions);
  const hasRequiredOptions = item.options.some(opt => opt.required);
  const allRequiredSelected = item.options
    .filter(opt => opt.required)
    .every(opt => selectedOptions[opt.id]?.length > 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      {item.imageUrl && (
        <div className="aspect-w-16 aspect-h-9 bg-gray-200">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
          <span className="text-lg font-bold text-green-600">
            {formatPrice(totalPrice)}
          </span>
        </div>

        {item.description && (
          <p className="text-gray-600 text-sm mb-3">{item.description}</p>
        )}

        {/* Options */}
        {showOptions && item.options.length > 0 && (
          <div className="space-y-3 mb-4">
            {item.options.map((option) => (
              <div key={option.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {option.name} {option.required && <span className="text-red-500">*</span>}
                </label>
                <div className="space-y-2">
                  {option.values.map((value) => (
                    <label key={value.id} className="flex items-center">
                      <input
                        type={option.type === "multi" ? "checkbox" : "radio"}
                        name={option.id}
                        value={value.id}
                        checked={selectedOptions[option.id]?.includes(value.id) || false}
                        onChange={() => handleOptionChange(option.id, value.id, option.type === "multi")}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        {value.label}
                        {value.priceDelta > 0 && (
                          <span className="text-green-600 ml-1">
                            (+{formatPrice(value.priceDelta)})
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!item.isAvailable || (hasRequiredOptions && !allRequiredSelected)}
          className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
            !item.isAvailable || (hasRequiredOptions && !allRequiredSelected)
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          {!item.isAvailable
            ? "Unavailable"
            : showOptions
            ? "Add to Cart"
            : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};
