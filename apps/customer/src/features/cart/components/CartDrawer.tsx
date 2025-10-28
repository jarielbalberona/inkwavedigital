import React, { useState } from "react";
import { XMarkIcon, MinusIcon, PlusIcon, TrashIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useCartStore } from "../hooks/stores/useCartStore";
import { useCreateOrder } from "../../order/hooks/mutations/useCreateOrder";
import { useSessionStore } from "../../menu/hooks/stores/useSessionStore";
import type { CartItem } from "../types/cart.types";

import type { CreateOrderData } from "../../order/types/order.types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: (orderData: CreateOrderData) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckout }) => {
  const { items, orderNotes, updateQuantity, removeItem, getTotal, clearCart, setOrderNotes } = useCartStore();
  const { venueId, tableId, deviceId, pax } = useSessionStore();
  const createOrderMutation = useCreateOrder();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const total = getTotal();

  const handleCheckout = async () => {
    if (!venueId || items.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      const orderData = {
        venueId,
        tableId: tableId || undefined,
        deviceId,
        pax: pax || undefined,
        notes: orderNotes || undefined,
        items: items.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.basePrice,
          notes: item.notes,
          optionsJson: JSON.stringify(item.selectedOptions),
        })),
      };
      
      const result = await createOrderMutation.mutateAsync(orderData);
      
      if (result) {
        clearCart();
        // Pass the order data to the callback
        onCheckout(result);
        onClose();
      }
    } catch (error) {
      console.error("Order submission failed:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Cart</h2>
            <div className="flex items-center space-x-2">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ShoppingBagIcon className="w-16 h-16 mb-4" />
                <p className="text-lg font-medium">Your cart is empty</p>
                <p className="text-sm">Add some items to get started</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onUpdateQuantity={(quantity) => updateQuantity(item.id, quantity)}
                    onRemove={() => removeItem(item.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Order Notes */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-4">
              <label htmlFor="order-notes" className="block text-sm font-medium text-gray-700 mb-2">
                Order Notes (Optional)
              </label>
              <textarea
                id="order-notes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Any special requests or notes for your order..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <div className="text-sm text-gray-500">
                  {pax && `${pax} ${pax === 1 ? 'person' : 'people'}`}
                </div>
                <div className="text-xs text-gray-400">
                  {orderNotes.length}/500 characters
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold text-green-600">
                  ₱{total.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  isSubmitting
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

const CartItemRow: React.FC<CartItemRowProps> = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-12 h-12 rounded-md object-cover"
        />
      )}
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
        <p className="text-sm text-gray-600">
          ₱{item.basePrice.toFixed(2)} × {item.quantity}
        </p>
        
        {/* Selected options */}
        {item.selectedOptions.length > 0 && (
          <div className="text-xs text-gray-500 mt-1 space-y-0.5">
            {item.selectedOptions.map((option) => (
              <div key={option.optionId}>
                <span className="font-medium">{option.optionName}:</span>{" "}
                {option.values.map((value, idx) => (
                  <span key={value.valueId}>
                    {value.valueLabel}
                    {value.priceDelta !== 0 && (
                      <span className="text-green-600">
                        {" "}(+₱{value.priceDelta.toFixed(2)})
                      </span>
                    )}
                    {idx < option.values.length - 1 && ", "}
                  </span>
                ))}
              </div>
            ))}
          </div>
        )}
        
        {/* Item notes */}
        {item.notes && (
          <p className="text-xs text-gray-500 mt-1 italic">Note: {item.notes}</p>
        )}
        
        {/* Total price for this item */}
        <p className="text-sm font-semibold text-gray-900 mt-1">
          Total: ₱{item.totalPrice.toFixed(2)}
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onUpdateQuantity(item.quantity - 1)}
          className="p-1 rounded-md hover:bg-gray-200"
        >
          <MinusIcon className="w-4 h-4" />
        </button>
        
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        
        <button
          onClick={() => onUpdateQuantity(item.quantity + 1)}
          className="p-1 rounded-md hover:bg-gray-200"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
        
        <button
          onClick={onRemove}
          className="p-1 rounded-md hover:bg-red-100 text-red-600"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
