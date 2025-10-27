import React, { useState, useEffect } from "react";
import type { Table } from "../types/table.types";

interface TableFormProps {
  table?: Table; // If provided, it's edit mode
  venueId: string;
  onSubmit: (data: TableFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface TableFormData {
  tableNumber?: number;
  name?: string;
  label: string;
  description?: string;
  capacity?: number;
  isActive?: boolean;
}

export const TableForm: React.FC<TableFormProps> = ({
  table,
  venueId,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<TableFormData>({
    tableNumber: table?.tableNumber,
    name: table?.name || "",
    label: table?.label || "",
    description: table?.description || "",
    capacity: table?.capacity,
    isActive: table?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (table) {
      setFormData({
        tableNumber: table.tableNumber,
        name: table.name || "",
        label: table.label,
        description: table.description || "",
        capacity: table.capacity,
        isActive: table.isActive,
      });
    }
  }, [table]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.label.trim()) {
      newErrors.label = "Label is required";
    }

    if (formData.tableNumber !== undefined && formData.tableNumber < 1) {
      newErrors.tableNumber = "Table number must be at least 1";
    }

    if (formData.capacity !== undefined && (formData.capacity < 1 || formData.capacity > 100)) {
      newErrors.capacity = "Capacity must be between 1 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    // Clean up empty strings to undefined
    const cleanedData: TableFormData = {
      ...formData,
      name: formData.name?.trim() || undefined,
      description: formData.description?.trim() || undefined,
      capacity: formData.capacity || undefined,
    };

    onSubmit(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Table Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Table Number {!table && "(auto-generated if not provided)"}
        </label>
        <input
          type="number"
          min="1"
          value={formData.tableNumber || ""}
          onChange={(e) =>
            setFormData({ ...formData, tableNumber: e.target.value ? parseInt(e.target.value) : undefined })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Auto-generated"
        />
        {errors.tableNumber && (
          <p className="text-red-500 text-sm mt-1">{errors.tableNumber}</p>
        )}
      </div>

      {/* Label */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Label <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Table 1, Table A"
          required
        />
        {errors.label && (
          <p className="text-red-500 text-sm mt-1">{errors.label}</p>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name (optional)
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Window Seat, VIP Room"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (optional)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Near the window with city view"
          rows={3}
        />
      </div>

      {/* Capacity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Capacity (optional)
        </label>
        <input
          type="number"
          min="1"
          max="100"
          value={formData.capacity || ""}
          onChange={(e) =>
            setFormData({ ...formData, capacity: e.target.value ? parseInt(e.target.value) : undefined })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Number of people"
        />
        {errors.capacity && (
          <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
        )}
        <p className="text-gray-500 text-xs mt-1">Number of people the table can accommodate (1-100)</p>
      </div>

      {/* Active Status (only show in edit mode) */}
      {table && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            Active
          </label>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : table ? "Update Table" : "Create Table"}
        </button>
      </div>
    </form>
  );
};

