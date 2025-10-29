import React, { useState } from "react";
import { XMarkIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useCreateItemOption, useCreateOptionValue, useDeleteOptionValue } from "../hooks";
import type { MenuItemOption, CreateItemOptionInput, CreateOptionValueInput } from "../types/menuManagement.types";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Checkbox } from "../../../components/ui/checkbox";
import { Button } from "../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import CurrencyInput from "react-currency-input-field";

interface ItemOptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  option?: MenuItemOption;
}

interface OptionValueFormData {
  label: string;
  priceDelta: number;
}

export const ItemOptionForm: React.FC<ItemOptionFormProps> = ({
  isOpen,
  onClose,
  itemId,
  option,
}) => {
  const [formData, setFormData] = useState({
    name: option?.name || "",
    type: (option?.type || "select") as "select" | "multi",
    required: option?.required || false,
  });

  const [values, setValues] = useState<OptionValueFormData[]>(
    option?.values.map((v) => ({ label: v.label, priceDelta: v.priceDelta })) || []
  );

  const [newValue, setNewValue] = useState<OptionValueFormData>({
    label: "",
    priceDelta: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOptionMutation = useCreateItemOption();
  const createValueMutation = useCreateOptionValue();
  const deleteValueMutation = useDeleteOptionValue();

  const handleAddValue = () => {
    if (newValue.label.trim()) {
      setValues([...values, newValue]);
      setNewValue({ label: "", priceDelta: 0 });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent Enter key from submitting (since we removed the form element)
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
      e.preventDefault();
    }
  };

  const handleRemoveValue = (index: number) => {
    setValues(values.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (option) {
        // TODO: Update existing option
        console.log("Update not implemented yet");
      } else {
        // Create new option
        console.log("Creating option with data:", { itemId, ...formData });
        const createData: CreateItemOptionInput = {
          itemId,
          ...formData,
        };

        const createdOption = await createOptionMutation.mutateAsync(createData);
        console.log("Option created:", createdOption);

        // Create all values for this option
        for (const value of values) {
          console.log("Creating value:", value);
          const valueData: CreateOptionValueInput = {
            optionId: createdOption.id,
            label: value.label,
            priceDelta: value.priceDelta,
          };
          await createValueMutation.mutateAsync(valueData);
        }

        console.log("All values created successfully");
      }

      onClose();
    } catch (err: any) {
      console.error("Error creating option:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to create option. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h2 className="text-lg font-semibold text-gray-900">
              {option ? "Edit Option" : "Add Option"}
            </h2>
            <button type="button" onClick={onClose} className="p-1 rounded-md hover:bg-gray-100">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6" onKeyDown={handleKeyDown}>
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Option Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Option Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Size, Type, Sugar Level"
                required
              />
            </div>

            {/* Option Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Selection Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as "select" | "multi" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select">Single Select (Radio)</SelectItem>
                  <SelectItem value="multi">Multi Select (Checkbox)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Required Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="required"
                checked={formData.required}
                onCheckedChange={(checked) => setFormData({ ...formData, required: checked as boolean })}
              />
              <Label
                htmlFor="required"
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Required (customer must select this option)
              </Label>
            </div>

            {/* Option Values */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Option Values</h3>

              {/* Existing Values */}
              <div className="space-y-2 mb-4">
                {values.map((value, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{value.label}</span>
                      {value.priceDelta !== 0 && (
                        <span className="ml-2 text-sm text-gray-600">
                          ({value.priceDelta > 0 ? "+" : ""}${value.priceDelta.toFixed(2)})
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveValue(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Value */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newValue.label}
                    onChange={(e) => setNewValue({ ...newValue, label: e.target.value })}
                    placeholder="Value label (e.g., Small, Medium, Large)"
                    className="flex-1"
                  />
                  <CurrencyInput
                    name="priceDelta"
                    placeholder="0.00"
                    value={newValue.priceDelta}
                    decimalsLimit={2}
                    onValueChange={(value) => setNewValue({ ...newValue, priceDelta: parseFloat(value || "0") })}
                    prefix="₱"
                    allowNegativeValue={true}
                    className="w-32 flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddValue}
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Price delta: positive values add to price, negative values subtract, zero for no change
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!formData.name || values.length === 0 || isSubmitting}
              >
                {isSubmitting ? "Creating..." : option ? "Update Option" : "Create Option"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

