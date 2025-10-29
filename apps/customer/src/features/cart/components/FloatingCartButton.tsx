import React from "react";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useCartStore } from "../hooks/stores/useCartStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FloatingCartButtonProps {
  onClick: () => void;
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ onClick }) => {
  const { getItemCount, getTotal } = useCartStore();
  const itemCount = getItemCount();
  const total = getTotal();

  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed bottom-6 right-6 rounded-full shadow-lg z-50 h-auto p-4 gap-2"
    >
      <ShoppingBagIcon className="w-6 h-6" />
      {itemCount > 0 && (
        <Badge variant="destructive" className="px-2 py-1 min-w-[20px] h-5">
          {itemCount}
        </Badge>
      )}
      {total > 0 && (
        <span className="text-sm font-medium">
          ₱{total.toFixed(2)}
        </span>
      )}
    </Button>
  );
};
