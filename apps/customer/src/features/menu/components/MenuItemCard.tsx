import React, { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import type { MenuItem } from "../types/menu.types";
import { formatPrice } from "../hooks/helpers/menuHelpers";
import { useCartStore } from "../../cart/hooks/stores/useCartStore";
import { MenuItemModal } from "./MenuItemModal";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SelectedOption } from "../../cart/types/cart.types";

interface MenuItemCardProps {
  item: MenuItem;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    // If item has options, open modal; otherwise add directly
    if (item.options.length > 0) {
      setIsModalOpen(true);
    } else {
      addItem(item, 1, [], undefined);
    }
  };

  const handleAddToCartFromModal = (
    item: MenuItem,
    quantity: number,
    selectedOptions: SelectedOption[],
    notes?: string
  ) => {
    addItem(item, quantity, selectedOptions, notes);
  };

  const DEFAULT_IMAGE = "https://pub-41bef80e05e044e8a7e02c461f986c84.r2.dev/a1088200-e822-4a1d-b796-ff6abf742155/1761589977537-wjwzl8.jpg";

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow gap-0 py-0">
      {/* Image */}
      <div className="aspect-w-16 aspect-h-9 bg-muted">
        <img
          src={item.imageUrl || DEFAULT_IMAGE}
          alt={item.name}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
          <span className="text-lg font-bold text-success">
            {formatPrice(item.price)}
          </span>
        </div>

        {item.description && (
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{item.description}</p>
        )}

        {/* Show options indicator */}
        {item.options.length > 0 && (
          <Badge variant="outline" className="mb-3">
            {item.options.length} customization option{item.options.length !== 1 ? "s" : ""} available
          </Badge>
        )}
      </CardContent>

      {/* Add to Cart Button */}
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={!item.isAvailable}
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          {!item.isAvailable ? "Unavailable" : "Add to Cart"}
        </Button>
      </CardFooter>

      {/* Menu Item Modal */}
      <MenuItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={item}
        onAddToCart={handleAddToCartFromModal}
      />
    </Card>
  );
};
