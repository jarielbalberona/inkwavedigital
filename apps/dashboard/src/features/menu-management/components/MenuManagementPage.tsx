import React, { useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { CategoryForm } from "./CategoryForm";
import { MenuItemForm } from "./MenuItemForm";
import { CategoryCard } from "./CategoryCard";
import { useCategoriesQuery } from "../hooks/queries/useCategoriesQuery";
import { useDeleteCategory } from "../hooks/mutations";
import { menuItemsApi } from "../api/menuItemsApi";
import { useQueryClient } from "@tanstack/react-query";
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

  const { data: categoriesData, isLoading } = useCategoriesQuery(venueId);
  const deleteCategoryMutation = useDeleteCategory(venueId);
  const queryClient = useQueryClient();

  // Ensure categories is always an array
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

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

  const handleEditMenuItem = (item: MenuItem, category: MenuCategory) => {
    setSelectedCategory(category);
    setEditingItem(item);
    setShowMenuItemForm(true);
  };

  const handleDeleteMenuItem = async (itemId: string, categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      try {
        await menuItemsApi.deleteMenuItem(itemId);
        // Invalidate the query to refresh the menu items list
        queryClient.invalidateQueries({ queryKey: ["menuItems", categoryId] });
      } catch (error) {
        console.error("Failed to delete menu item:", error);
        alert("Failed to delete menu item. Please try again.");
      }
    }
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
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={() => handleEditCategory(category)}
                onDelete={() => handleDeleteCategory(category.id)}
                onAddItem={() => handleCreateMenuItem(category)}
                onEditItem={(item) => handleEditMenuItem(item, category)}
                onDeleteItem={(itemId) => handleDeleteMenuItem(itemId, category.id)}
              />
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
        venueId={venueId}
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
