import type { MenuItem, MenuCategory } from "../../types/menu.types";

export const groupMenuItemsByCategory = (items: MenuItem[]): Record<string, MenuItem[]> => {
  return items.reduce((acc, item) => {
    if (!acc[item.categoryId]) {
      acc[item.categoryId] = [];
    }
    acc[item.categoryId].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);
};

// Category mapping based on the seed data
const CATEGORY_NAMES: Record<string, string> = {
  "816e9008-e1bd-4368-8175-2cb1843556b4": "Pizza",
  "44a7e2a8-ad84-4634-a483-703ec1ebe127": "Pasta", 
  "fee39c20-ee68-4e39-aae9-7530d8595dbb": "Drinks",
  "71e5b4cb-384a-4947-9d0d-e424e58ab102": "Desserts",
  "25e0adbf-b3b4-4ec7-aeef-0d32ad444734": "Sides",
  "aa126dbd-fc71-46c6-8efc-0167984284ef": "Specials"
};

export const getCategoriesFromItems = (items: MenuItem[]): MenuCategory[] => {
  const categoryMap = new Map<string, MenuCategory>();
  
  items.forEach(item => {
    if (!categoryMap.has(item.categoryId)) {
      const categoryName = CATEGORY_NAMES[item.categoryId] || `Category ${item.categoryId.slice(0, 8)}`;
      categoryMap.set(item.categoryId, {
        id: item.categoryId,
        name: categoryName,
        sortIndex: Object.keys(CATEGORY_NAMES).indexOf(item.categoryId),
      });
    }
  });
  
  return Array.from(categoryMap.values()).sort((a, b) => a.sortIndex - b.sortIndex);
};

export const formatPrice = (price: number): string => {
  return `₱${price.toFixed(2)}`;
};

export const getItemTotalPrice = (item: MenuItem, selectedOptions: Record<string, string[]> = {}): number => {
  let total = item.price;
  
  Object.entries(selectedOptions).forEach(([optionId, selectedValues]) => {
    const option = item.options.find(opt => opt.id === optionId);
    if (option) {
      selectedValues.forEach(valueId => {
        const optionValue = option.values.find(val => val.id === valueId);
        if (optionValue) {
          total += optionValue.priceDelta;
        }
      });
    }
  });
  
  return total;
};
