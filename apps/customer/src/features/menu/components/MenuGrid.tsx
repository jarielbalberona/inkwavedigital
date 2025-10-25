import React, { useRef, useEffect } from "react";
import { MenuItemCard } from "./MenuItemCard";
import type { MenuItem, MenuCategory } from "../types/menu.types";

interface MenuGridProps {
  items: MenuItem[];
  categories: MenuCategory[];
  activeCategoryId: string | null;
  onCategoryChange: (categoryId: string) => void;
}

export const MenuGrid: React.FC<MenuGridProps> = ({
  items,
  categories,
  activeCategoryId,
  onCategoryChange,
}) => {
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const itemsByCategory = items.reduce((acc, item) => {
    if (!acc[item.categoryId]) {
      acc[item.categoryId] = [];
    }
    acc[item.categoryId].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  useEffect(() => {
    if (activeCategoryId && categoryRefs.current[activeCategoryId]) {
      categoryRefs.current[activeCategoryId]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [activeCategoryId]);

  const handleIntersection = (categoryId: string) => {
    onCategoryChange(categoryId);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 space-y-8">
        {categories.map((category) => {
          const categoryItems = itemsByCategory[category.id] || [];
          
          if (categoryItems.length === 0) return null;

          return (
            <div
              key={category.id}
              ref={(el) => (categoryRefs.current[category.id] = el)}
              className="scroll-mt-4"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4 sticky top-0 bg-white py-2 z-10">
                {category.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
