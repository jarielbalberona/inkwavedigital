import type { MenuItem, MenuItemOption } from "../../menu/types/menu.types";

export interface CartItem {
  id: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  selectedOptions: Record<string, string[]>; // optionId -> selected value IDs
  totalPrice: number; // calculated price including options
}

export interface CartStore {
  items: CartItem[];
  addItem: (item: MenuItem, selectedOptions?: Record<string, string[]>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}
