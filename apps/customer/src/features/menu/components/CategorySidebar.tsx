import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import type { MenuCategory } from "../types/menu.types";

interface CategorySidebarProps {
  categories: MenuCategory[];
  activeCategoryId: string | null;
  onCategorySelect: (categoryId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  activeCategoryId,
  onCategorySelect,
  isCollapsed,
  onToggleCollapse,
}) => {
  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? "w-16" : "w-64"
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="overflow-y-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`w-full flex items-center p-4 text-left hover:bg-gray-50 transition-colors ${
              activeCategoryId === category.id
                ? "bg-blue-50 border-r-2 border-blue-500 text-blue-700"
                : "text-gray-700"
            }`}
          >
            {category.iconUrl && (
              <img
                src={category.iconUrl}
                alt={category.name}
                className="w-6 h-6 rounded mr-3 flex-shrink-0"
              />
            )}
            {!isCollapsed && (
              <span className="font-medium truncate">{category.name}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
