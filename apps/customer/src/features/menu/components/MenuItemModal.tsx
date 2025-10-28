import React, { useState, useEffect } from "react";
import { XMarkIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import type { MenuItem, MenuItemOption } from "../types/menu.types";

interface SelectedOption {
  optionId: string;
  optionName: string;
  valueIds: string[]; // Array to support multi-select
  values: Array<{
    valueId: string;
    valueLabel: string;
    priceDelta: number;
  }>;
}

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity: number, selectedOptions: SelectedOption[], notes?: string) => void;
}

const DEFAULT_IMAGE = "https://pub-41bef80e05e044e8a7e02c461f986c84.r2.dev/a1088200-e822-4a1d-b796-ff6abf742155/1761589977537-wjwzl8.jpg";

export const MenuItemModal: React.FC<MenuItemModalProps> = ({
  isOpen,
  onClose,
  item,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState("");

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedOptions({});
      setNotes("");
      setValidationError("");
    }
  }, [isOpen]);

  const handleOptionChange = (option: MenuItemOption, valueId: string) => {
    setValidationError("");
    
    if (option.type === "select") {
      // Single select - replace existing selection
      setSelectedOptions({
        ...selectedOptions,
        [option.id]: [valueId],
      });
    } else {
      // Multi select - toggle selection
      const current = selectedOptions[option.id] || [];
      const newSelection = current.includes(valueId)
        ? current.filter((id) => id !== valueId)
        : [...current, valueId];
      
      setSelectedOptions({
        ...selectedOptions,
        [option.id]: newSelection,
      });
    }
  };

  const calculateTotalPrice = (): number => {
    let total = item.price;

    // Add price deltas from selected options
    item.options.forEach((option) => {
      const selectedValueIds = selectedOptions[option.id] || [];
      selectedValueIds.forEach((valueId) => {
        const value = option.values.find((v) => v.id === valueId);
        if (value) {
          total += value.priceDelta;
        }
      });
    });

    return total * quantity;
  };

  const validateAndAddToCart = () => {
    // Validate required options
    for (const option of item.options) {
      if (option.required) {
        const selected = selectedOptions[option.id] || [];
        if (selected.length === 0) {
          setValidationError(`Please select ${option.name}`);
          return;
        }
      }
    }

    // Build selected options array
    const optionsArray: SelectedOption[] = item.options
      .filter((option) => selectedOptions[option.id]?.length > 0)
      .map((option) => {
        const valueIds = selectedOptions[option.id];
        const values = valueIds.map((valueId) => {
          const value = option.values.find((v) => v.id === valueId)!;
          return {
            valueId: value.id,
            valueLabel: value.label,
            priceDelta: value.priceDelta,
          };
        });

        return {
          optionId: option.id,
          optionName: option.name,
          valueIds,
          values,
        };
      });

    onAddToCart(item, quantity, optionsArray, notes || undefined);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header with Image */}
          <div className="relative">
            <img
              src={item.imageUrl || DEFAULT_IMAGE}
              alt={item.name}
              className="w-full h-64 object-cover rounded-t-lg"
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Item Info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
              {item.description && (
                <p className="mt-2 text-gray-600">{item.description}</p>
              )}
              <p className="mt-2 text-xl font-semibold text-green-600">
                ₱{item.price.toFixed(2)}
              </p>
            </div>

            {/* Options */}
            {item.options.length > 0 && (
              <div className="space-y-4 border-t border-gray-200 pt-6">
                {item.options.map((option) => (
                  <div key={option.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900">
                      {option.name}
                      {option.required && (
                        <span className="ml-1 text-red-600">*</span>
                      )}
                    </label>

                    {option.type === "select" ? (
                      // Radio buttons for single select
                      <div className="space-y-2">
                        {option.values.map((value) => (
                          <label
                            key={value.id}
                            className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                          >
                            <input
                              type="radio"
                              name={option.id}
                              checked={selectedOptions[option.id]?.[0] === value.id}
                              onChange={() => handleOptionChange(option, value.id)}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="ml-3 flex-1 text-gray-900">
                              {value.label}
                            </span>
                            {value.priceDelta !== 0 && (
                              <span className="text-sm text-gray-600">
                                {value.priceDelta > 0 ? "+" : ""}₱
                                {value.priceDelta.toFixed(2)}
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    ) : (
                      // Checkboxes for multi select
                      <div className="space-y-2">
                        {option.values.map((value) => (
                          <label
                            key={value.id}
                            className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={selectedOptions[option.id]?.includes(value.id) || false}
                              onChange={() => handleOptionChange(option, value.id)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-3 flex-1 text-gray-900">
                              {value.label}
                            </span>
                            {value.priceDelta !== 0 && (
                              <span className="text-sm text-gray-600">
                                {value.priceDelta > 0 ? "+" : ""}₱
                                {value.priceDelta.toFixed(2)}
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Validation Error */}
            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{validationError}</p>
              </div>
            )}

            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Special Instructions (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
              <span className="text-sm font-medium text-gray-900">Quantity</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <MinusIcon className="w-4 h-4" />
                </button>
                <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={validateAndAddToCart}
              className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Add to Cart - ₱{calculateTotalPrice().toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

