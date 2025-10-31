import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useVenueInfoQuery } from "../hooks/queries/useVenueInfoQuery";
import { Button } from "@/components/ui/button";
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
  const [imageErrors, setImageErrors] = React.useState<Record<string, boolean>>({});
  const [logoError, setLogoError] = React.useState(false);

  const handleImageError = (categoryId: string) => {
    setImageErrors(prev => ({ ...prev, [categoryId]: true }));
  };

  const logoUrl = venueInfo?.tenant?.settings?.branding?.logoUrl;
  const tenantInitials = venueInfo?.tenant?.name
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "IW";

  return (
    <div className={`bg-card border-r border-border transition-all duration-300 ${
      isCollapsed ? "w-20 md:w-20" : "w-20 md:w-64"
    }`}>
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-border flex items-center justify-between min-h-22!">
        <div className="flex items-center justify-center md:justify-start w-full justify-between">
          <div className="flex items-center space-x-2">
            {/* Logo */}
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center overflow-hidden">
              {logoUrl && !logoError ? (
                <img
                  src={logoUrl}
                  alt={venueInfo?.tenant?.name || "Logo"}
                  className="w-full h-full object-cover"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="text-primary-foreground font-bold text-sm">{tenantInitials}</span>
              )}
            </div>
            {/* Tenant Name - Desktop only when expanded */}
            <div className="hidden md:block">
              {!isCollapsed && (
                <>
                  <h2 className="text-lg font-semibold text-foreground">
                    {venueInfo?.tenant.name || "Welcome"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {venueInfo?.name || "Digital Menu"}
                  </p>
                </>
              )}
            </div>
          </div>
          {/* Collapse button - Desktop only */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleCollapse}
            className="hidden md:flex ml-auto"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-5 h-5" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="overflow-y-auto">
        {categories.map((category) => {
          const icon = CATEGORY_ICONS[category.id] || "📋";
          const isActive = activeCategoryId === category.id;
          return (
            <Button
              key={category.id}
              variant={isActive ? "default" : "ghost"}
              onClick={() => onCategorySelect(category.id)}
              className={`w-full justify-start rounded-none h-16 ${
                isActive ? "border-r-2 border-primary" : ""
              }`}
            >
              {isCollapsed ? (
                // Collapsed view - Desktop only
                <div className="hidden md:flex items-center justify-center w-full">
                  <div className="w-8 h-8 flex items-center justify-center text-xl">
                    {category.iconUrl && category.iconUrl.startsWith('http') && !imageErrors[category.id] ? (
                      <img
                        src={category.iconUrl}
                        alt={category.name}
                        className="w-8 h-8 rounded object-cover"
                        onError={() => handleImageError(category.id)}
                      />
                    ) : category.iconUrl && !category.iconUrl.startsWith('http') ? (
                      category.iconUrl
                    ) : (
                      icon
                    )}
                  </div>
                </div>
              ) : (
                // Expanded view - Always shown on mobile, conditional on desktop
                <div className="w-full">
                  <div className="flex flex-col md:flex-row md:items-center">
                    {/* Icon/Emoji */}
                    <div className="flex justify-center md:justify-start mb-1 md:mb-0">
                      {category.iconUrl && category.iconUrl.startsWith('http') && !imageErrors[category.id] ? (
                        <img
                          src={category.iconUrl}
                          alt={category.name}
                          className="w-6 h-6 md:w-8 md:h-8 rounded object-cover"
                          onError={() => handleImageError(category.id)}
                        />
                      ) : category.iconUrl && !category.iconUrl.startsWith('http') ? (
                        <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-lg md:text-xl">
                          {category.iconUrl}
                        </div>
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
            </Button>
          );
        })}
      </div>
    </div>
  );
};
