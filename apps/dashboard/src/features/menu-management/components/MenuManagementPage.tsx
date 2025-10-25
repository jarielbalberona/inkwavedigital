import React, { useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { CategoryForm } from "./CategoryForm";
import { MenuItemForm } from "./MenuItemForm";
import { useCategoriesQuery } from "../hooks/queries/useCategoriesQuery";
import { useDeleteCategory } from "../hooks/mutations";
import type { MenuCategory, MenuItem } from "../types/menuManagement.types";

interface MenuManagementPageProps {
  venueId: string;
}

export const MenuManagementPage: React.FC<MenuManagementPageProps> = ({ venueId }) => {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showMenuItemForm, setShowMenuItemForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // For demo purposes, use a mock menu ID
  const menuId = "demo-menu-id";
  
  const { data: categoriesData, isLoading } = useCategoriesQuery(menuId);
  const deleteCategoryMutation = useDeleteCategory(menuId);

  const categories = categoriesData?.data || [];

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category: MenuCategory) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      await deleteCategoryMutation.mutateAsync(categoryId);
    }
  };

  const handleCreateMenuItem = (category: MenuCategory) => {
    setSelectedCategory(category);
    setEditingItem(null);
    setShowMenuItemForm(true);
  };

  const handleEditMenuItem = (item: MenuItem) => {
    setEditingItem(item);
    setShowMenuItemForm(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
            <p className="text-gray-600">Manage your menu categories and items</p>
          </div>
          <button
            onClick={handleCreateCategory}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Category
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No categories found</p>
            <button
              onClick={handleCreateCategory}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-600">Sort: {category.sortIndex}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {category.iconUrl && (
                  <img
                    src={category.iconUrl}
                    alt={category.name}
                    className="w-full h-32 object-cover rounded-md mb-4"
                  />
                )}

                <div className="space-y-2">
                  <p className="text-sm text-gray-600">0 items</p>
                  <button
                    onClick={() => handleCreateMenuItem(category)}
                    className="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Item
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Forms */}
      <CategoryForm
        isOpen={showCategoryForm}
        onClose={() => {
          setShowCategoryForm(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        menuId={menuId}
      />

      <MenuItemForm
        isOpen={showMenuItemForm}
        onClose={() => {
          setShowMenuItemForm(false);
          setEditingItem(null);
          setSelectedCategory(null);
        }}
        item={editingItem}
        categoryId={selectedCategory?.id || ""}
      />
    </div>
  );
};
