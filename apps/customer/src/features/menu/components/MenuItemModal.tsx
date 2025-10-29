import React, { useState, useEffect } from "react";
import { XMarkIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import type { MenuItem, MenuItemOption } from "../types/menu.types";
import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Label } from "../../../components/ui/label";

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
        <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header with Image */}
          <div className="relative">
            <img
              src={item.imageUrl || DEFAULT_IMAGE}
              alt={item.name}
              className="w-full h-64 object-cover rounded-t-lg"
            />
            <Button
              variant="secondary"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 shadow-lg"
            >
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Item Info */}
            <div>
              <h2 className="text-2xl font-bold text-foreground">{item.name}</h2>
              {item.description && (
                <p className="mt-2 text-muted-foreground">{item.description}</p>
              )}
              <p className="mt-2 text-xl font-semibold text-success">
                ₱{item.price.toFixed(2)}
              </p>
            </div>

            {/* Options */}
            {item.options.length > 0 && (
              <div className="space-y-4 border-t border-border pt-6">
                {item.options.map((option) => (
                  <div key={option.id} className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      {option.name}
                      {option.required && (
                        <span className="ml-1 text-destructive">*</span>
                      )}
                    </label>

                    {option.type === "select" ? (
                      // Radio buttons for single select
                      <RadioGroup
                        value={selectedOptions[option.id]?.[0] || ""}
                        onValueChange={(valueId) => handleOptionChange(option, valueId)}
                        className="space-y-2"
                      >
                        {option.values.map((value) => (
                          <label
                            key={value.id}
                            className="flex items-center p-3 border border-border rounded-lg cursor-pointer hover:bg-accent"
                          >
                            <RadioGroupItem value={value.id} id={value.id} />
                            <Label
                              htmlFor={value.id}
                              className="ml-3 flex-1 text-foreground cursor-pointer font-normal"
                            >
                              {value.label}
                            </Label>
                            {value.priceDelta !== 0 && (
                              <span className="text-sm text-muted-foreground">
                                {value.priceDelta > 0 ? "+" : ""}₱
                                {value.priceDelta.toFixed(2)}
                              </span>
                            )}
                          </label>
                        ))}
                      </RadioGroup>
                    ) : (
                      // Checkboxes for multi select
                      <div className="space-y-2">
                        {option.values.map((value) => (
                          <label
                            key={value.id}
                            className="flex items-center p-3 border border-border rounded-lg cursor-pointer hover:bg-accent"
                          >
                            <Checkbox
                              id={value.id}
                              checked={selectedOptions[option.id]?.includes(value.id) || false}
                              onCheckedChange={() => handleOptionChange(option, value.id)}
                            />
                            <Label
                              htmlFor={value.id}
                              className="ml-3 flex-1 text-foreground cursor-pointer font-normal"
                            >
                              {value.label}
                            </Label>
                            {value.priceDelta !== 0 && (
                              <span className="text-sm text-muted-foreground">
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
              <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-sm text-destructive">{validationError}</p>
              </div>
            )}

            {/* Special Instructions */}
            <div>
              <Label htmlFor="notes" className="block mb-2">
                Special Instructions (Optional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests?"
                rows={3}
              />
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between border-t border-border pt-6">
              <span className="text-sm font-medium text-foreground">Quantity</span>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <MinusIcon className="w-4 h-4" />
                </Button>
                <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <PlusIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={validateAndAddToCart}
              className="w-full py-4 text-lg font-semibold"
              size="lg"
            >
              Add to Cart - ₱{calculateTotalPrice().toFixed(2)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

