import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartStore, SelectedOption } from "../../types/cart.types";
import type { MenuItem } from "../../../menu/types/menu.types";

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      orderNotes: "",
      
      addItem: (item: MenuItem, quantity: number, selectedOptions: SelectedOption[], notes?: string) => {
        // Calculate item price (base + option deltas)
        let itemPrice = item.price;
        selectedOptions.forEach((option) => {
          option.values.forEach((value) => {
            itemPrice += value.priceDelta;
          });
        });
        
        const totalPrice = itemPrice * quantity;
        
        const cartItem: CartItem = {
          id: `${item.id}-${Date.now()}-${Math.random()}`, // Unique ID for each cart entry
          itemId: item.id,
          name: item.name,
          basePrice: item.price,
          quantity,
          imageUrl: item.imageUrl,
          selectedOptions,
          notes,
          totalPrice,
        };
        
        set((state) => ({
          items: [...state.items, cartItem],
        }));
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
          items: state.items.map((item) => {
            if (item.id === id) {
              // Recalculate item price (base + option deltas)
              let itemPrice = item.basePrice;
              item.selectedOptions.forEach((option) => {
                option.values.forEach((value) => {
                  itemPrice += value.priceDelta;
                });
              });
              return { ...item, quantity, totalPrice: itemPrice * quantity };
            }
            return item;
          }),
        }));
      },
      
      setOrderNotes: (notes: string) => {
        set({ orderNotes: notes });
      },
      
      clearCart: () => {
        set({ items: [], orderNotes: "" });
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
