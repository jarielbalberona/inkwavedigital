import React from "react";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useCartStore } from "../hooks/stores/useCartStore";

interface FloatingCartButtonProps {
  onClick: () => void;
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ onClick }) => {
  const { getItemCount, getTotal } = useCartStore();
  const itemCount = getItemCount();
  const total = getTotal();

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50 flex items-center space-x-2"
    >
      <ShoppingBagIcon className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
      {total > 0 && (
        <span className="text-sm font-medium">
          ₱{total.toFixed(2)}
        </span>
      )}
    </button>
  );
};
