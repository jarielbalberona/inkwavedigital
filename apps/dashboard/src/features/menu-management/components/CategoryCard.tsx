import React from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useMenuItemsQuery } from "../hooks/queries/useMenuItemsQuery";
import type { MenuCategory } from "../types/menuManagement.types";

interface CategoryCardProps {
  category: MenuCategory;
  onEdit: () => void;
  onDelete: () => void;
  onAddItem: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  onAddItem,
}) => {
  const { data: items, isLoading } = useMenuItemsQuery(category.id);
  const menuItems = Array.isArray(items) ? items : [];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
          <p className="text-sm text-gray-600">Sort: {category.sortIndex}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {category.iconUrl && (
        category.iconUrl.startsWith('http') ? (
          <img
            src={category.iconUrl}
            alt={category.name}
            className="w-full h-32 object-cover rounded-md mb-4"
          />
        ) : (
          <div className="w-full h-32 flex items-center justify-center text-6xl mb-4 bg-gray-50 rounded-md">
            {category.iconUrl}
          </div>
        )
      )}

      <div className="space-y-2">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading items...</p>
        ) : (
          <p className="text-sm text-gray-600">{menuItems.length} item(s)</p>
        )}
        
        {/* Show menu items if available */}
        {menuItems.length > 0 && (
          <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.id} className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                {item.name} - ${item.price}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onAddItem}
          className="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Item
        </button>
      </div>
    </div>
  );
};
