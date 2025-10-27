import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useVenueInfoQuery } from "../hooks/queries/useVenueInfoQuery";
import type { MenuCategory } from "../types/menu.types";

interface CategorySidebarProps {
  categories: MenuCategory[];
  activeCategoryId: string | null;
  onCategorySelect: (categoryId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  venueId: string;
}

// Category icons mapping for mobile-first design
const CATEGORY_ICONS: Record<string, string> = {
  "816e9008-e1bd-4368-8175-2cb1843556b4": "🍕", // Pizza
  "44a7e2a8-ad84-4634-a483-703ec1ebe127": "🍝", // Pasta
  "fee39c20-ee68-4e39-aae9-7530d8595dbb": "🥤", // Drinks
  "71e5b4cb-384a-4947-9d0d-e424e58ab102": "🍰", // Desserts
  "25e0adbf-b3b4-4ec7-aeef-0d32ad444734": "🍟", // Sides
  "aa126dbd-fc71-46c6-8efc-0167984284ef": "⭐", // Specials
};

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  activeCategoryId,
  onCategorySelect,
  isCollapsed,
  onToggleCollapse,
  venueId,
}) => {
  const { data: venueInfo } = useVenueInfoQuery(venueId);
  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? "w-20 md:w-20" : "w-20 md:w-64"
    }`}>
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-gray-200">
        <div className="flex items-center justify-center md:justify-start">
          <div className="flex items-center space-x-2">
            {/* Logo */}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IW</span>
            </div>
            {/* Tenant Name - Desktop only when expanded */}
            <div className="hidden md:block">
              {!isCollapsed && (
                <>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {venueInfo?.tenant.name || "Welcome"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {venueInfo?.name || "Digital Menu"}
                  </p>
                </>
              )}
            </div>
          </div>
          {/* Collapse button - Desktop only */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:block ml-auto p-1 rounded-md hover:bg-gray-100 transition-colors"
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
        {categories.map((category) => {
          const icon = CATEGORY_ICONS[category.id] || "📋";
          return (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className={`w-full text-left hover:bg-gray-50 transition-colors ${
                activeCategoryId === category.id
                  ? "bg-blue-50 border-r-2 border-blue-500 text-blue-700"
                  : "text-gray-700"
              }`}
            >
              {isCollapsed ? (
                // Collapsed view - Desktop only
                <div className="hidden md:flex items-center justify-center p-4">
                  <div className="w-8 h-8 flex items-center justify-center text-xl">
                    {category.iconUrl ? (
                      <img
                        src={category.iconUrl}
                        alt={category.name}
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      icon
                    )}
                  </div>
                </div>
              ) : (
                // Expanded view - Always shown on mobile, conditional on desktop
                <div className="p-2 md:p-4">
                  <div className="flex flex-col md:flex-row md:items-center">
                    {/* Icon/Emoji */}
                    <div className="flex justify-center md:justify-start mb-1 md:mb-0">
                      {category.iconUrl ? (
                        // Check if it's a URL (starts with http) or emoji
                        category.iconUrl.startsWith('http') ? (
                          <img
                            src={category.iconUrl}
                            alt={category.name}
                            className="w-6 h-6 md:w-8 md:h-8 rounded object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-lg md:text-xl">
                            {category.iconUrl}
                          </div>
                        )
                      ) : (
                        <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-lg md:text-xl">
                          {icon}
                        </div>
                      )}
                    </div>
                    
                    {/* Category Name */}
                    <div className="text-center md:text-left md:ml-3">
                      <span className="font-medium text-xs md:text-base truncate block">
                        {category.name}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
