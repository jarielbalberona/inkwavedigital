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

export const getCategoriesFromItems = (items: MenuItem[]): MenuCategory[] => {
  const categoryMap = new Map<string, MenuCategory>();
  
  items.forEach(item => {
    if (!categoryMap.has(item.categoryId)) {
      // For now, we'll create a basic category structure
      // In a real app, you'd fetch categories separately
      categoryMap.set(item.categoryId, {
        id: item.categoryId,
        name: `Category ${item.categoryId.slice(0, 8)}`, // Temporary name
        sortIndex: 0,
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
