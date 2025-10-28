import React, { useState } from "react";
import { XMarkIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useCreateItemOption, useCreateOptionValue, useDeleteOptionValue } from "../hooks";
import type { MenuItemOption, CreateItemOptionInput, CreateOptionValueInput } from "../types/menuManagement.types";

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

  const createOptionMutation = useCreateItemOption();
  const createValueMutation = useCreateOptionValue();
  const deleteValueMutation = useDeleteOptionValue();

  const handleAddValue = () => {
    if (newValue.label.trim()) {
      setValues([...values, newValue]);
      setNewValue({ label: "", priceDelta: 0 });
    }
  };

  const handleRemoveValue = (index: number) => {
    setValues(values.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (option) {
      // TODO: Update existing option
      console.log("Update not implemented yet");
    } else {
      // Create new option
      const createData: CreateItemOptionInput = {
        itemId,
        ...formData,
      };

      const createdOption = await createOptionMutation.mutateAsync(createData);

      // Create all values for this option
      for (const value of values) {
        const valueData: CreateOptionValueInput = {
          optionId: createdOption.id,
          label: value.label,
          priceDelta: value.priceDelta,
        };
        await createValueMutation.mutateAsync(valueData);
      }
    }

    onClose();
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
            <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Option Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Option Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Size, Type, Sugar Level"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Option Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selection Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as "select" | "multi" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="select">Single Select (Radio)</option>
                <option value="multi">Multi Select (Checkbox)</option>
              </select>
            </div>

            {/* Required Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="required"
                checked={formData.required}
                onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="required" className="ml-2 text-sm font-medium text-gray-700">
                Required (customer must select this option)
              </label>
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
                  <input
                    type="text"
                    value={newValue.label}
                    onChange={(e) => setNewValue({ ...newValue, label: e.target.value })}
                    placeholder="Value label (e.g., Small, Medium, Large)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={newValue.priceDelta}
                    onChange={(e) => setNewValue({ ...newValue, priceDelta: parseFloat(e.target.value) || 0 })}
                    placeholder="Price delta"
                    step="0.01"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddValue}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-1"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Price delta: positive values add to price, negative values subtract, zero for no change
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.name || values.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {option ? "Update Option" : "Create Option"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

