import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useCreateMenuItem, useUpdateMenuItem } from "../hooks/mutations";
import type { MenuItem, CreateMenuItemInput, UpdateMenuItemInput } from "../types/menuManagement.types";
import { ImagePicker } from "../../image-library/components/ImagePicker";

interface MenuItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  item?: MenuItem;
  categoryId: string;
}

export const MenuItemForm: React.FC<MenuItemFormProps> = ({
  isOpen,
  onClose,
  item,
  categoryId,
}) => {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    description: item?.description || "",
    price: item?.price || 0,
    imageUrl: item?.imageUrl || "",
    isAvailable: item?.isAvailable ?? true,
  });

  const createMenuItemMutation = useCreateMenuItem(categoryId);
  const updateMenuItemMutation = useUpdateMenuItem(categoryId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (item) {
      // Update existing item
      const updateData: UpdateMenuItemInput = {
        id: item.id,
        ...formData,
      };
      await updateMenuItemMutation.mutateAsync(updateData);
    } else {
      // Create new item
      const createData: CreateMenuItemInput = {
        categoryId,
        ...formData,
      };
      await createMenuItemMutation.mutateAsync(createData);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {item ? "Edit Menu Item" : "Add Menu Item"}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₱)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Image
              </label>
              <ImagePicker
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                type="image"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAvailable"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
                Available for ordering
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMenuItemMutation.isPending || updateMenuItemMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createMenuItemMutation.isPending || updateMenuItemMutation.isPending
                  ? "Saving..."
                  : item
                  ? "Update"
                  : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
