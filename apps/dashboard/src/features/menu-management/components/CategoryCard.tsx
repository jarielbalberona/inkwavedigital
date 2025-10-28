import React from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useMenuItemsQuery } from "../hooks/queries/useMenuItemsQuery";
import type { MenuCategory, MenuItem } from "../types/menuManagement.types";

interface CategoryCardProps {
  category: MenuCategory;
  onEdit: () => void;
  onDelete: () => void;
  onAddItem: () => void;
  onEditItem: (item: MenuItem) => void;
  onDeleteItem: (itemId: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  onAddItem,
  onEditItem,
  onDeleteItem,
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
          <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
            {menuItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-gray-50 p-3 rounded-md border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Item Image Thumbnail */}
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded flex-shrink-0"
                    />
                  )}
                  
                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </h4>
                        {item.description && (
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-semibold text-gray-900">
                            ₱{item.price.toFixed(2)}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            item.isAvailable 
                              ? "bg-green-100 text-green-700" 
                              : "bg-red-100 text-red-700"
                          }`}>
                            {item.isAvailable ? "Available" : "Unavailable"}
                          </span>
                          {item.options?.length > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              {item.options.length} option{item.options.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => onEditItem(item)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit item"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete item"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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
