import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useCreateCategory, useUpdateCategory } from "../hooks/mutations";
import type { MenuCategory, CreateCategoryInput, UpdateCategoryInput } from "../types/menuManagement.types";

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  category?: MenuCategory;
  menuId: string;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  isOpen,
  onClose,
  category,
  menuId,
}) => {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    iconUrl: category?.iconUrl || "",
    sortIndex: category?.sortIndex || 0,
  });

  const createCategoryMutation = useCreateCategory(menuId);
  const updateCategoryMutation = useUpdateCategory(menuId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (category) {
      // Update existing category
      const updateData: UpdateCategoryInput = {
        id: category.id,
        ...formData,
      };
      await updateCategoryMutation.mutateAsync(updateData);
    } else {
      // Create new category
      const createData: CreateCategoryInput = {
        menuId,
        ...formData,
      };
      await createCategoryMutation.mutateAsync(createData);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {category ? "Edit Category" : "Add Category"}
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
                Category Name
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
                Icon URL
              </label>
              <input
                type="url"
                value={formData.iconUrl}
                onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/icon.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={formData.sortIndex}
                onChange={(e) => setFormData({ ...formData, sortIndex: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
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
                disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createCategoryMutation.isPending || updateCategoryMutation.isPending
                  ? "Saving..."
                  : category
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
