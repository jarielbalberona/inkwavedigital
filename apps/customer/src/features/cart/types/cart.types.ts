import type { MenuItem, MenuItemOption } from "../../menu/types/menu.types";

export interface SelectedOption {
  optionId: string;
  optionName: string;
  valueIds: string[];
  values: Array<{
    valueId: string;
    valueLabel: string;
    priceDelta: number;
  }>;
}

export interface CartItem {
  id: string;
  itemId: string;
  name: string;
  basePrice: number;
  quantity: number;
  imageUrl?: string;
  selectedOptions: SelectedOption[];
  notes?: string;
  totalPrice: number; // calculated price including options × quantity
}

export interface CartStore {
  items: CartItem[];
  orderNotes: string;
  addItem: (item: MenuItem, quantity: number, selectedOptions: SelectedOption[], notes?: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setOrderNotes: (notes: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}
