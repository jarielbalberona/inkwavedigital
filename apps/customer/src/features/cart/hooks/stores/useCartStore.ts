import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartStore } from "../../types/cart.types";
import type { MenuItem } from "../../../menu/types/menu.types";
import { getItemTotalPrice } from "../../../menu/hooks/helpers/menuHelpers";

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item: MenuItem, selectedOptions: Record<string, string[]> = {}) => {
        const totalPrice = getItemTotalPrice(item, selectedOptions);
        const cartItem: CartItem = {
          id: `${item.id}-${JSON.stringify(selectedOptions)}`,
          itemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          imageUrl: item.imageUrl,
          selectedOptions,
          totalPrice,
        };
        
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.itemId === item.id && 
            JSON.stringify(i.selectedOptions) === JSON.stringify(selectedOptions)
          );
          
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === existingItem.id
                  ? { ...i, quantity: i.quantity + 1, totalPrice: i.totalPrice + totalPrice }
                  : i
              ),
            };
          }
          
          return { items: [...state.items, cartItem] };
        });
      },
      
      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      
      updateQuantity: (id: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity, totalPrice: item.price * quantity }
              : item
          ),
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.totalPrice, 0);
      },
      
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
