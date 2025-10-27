import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import type { OrderConfirmation } from "../types/order.types";

interface OrderConfirmationProps {
  order: OrderConfirmation;
  onBackToMenu: () => void;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  order,
  onBackToMenu,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-6">Your order has been placed successfully</p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{order.orderId.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold text-green-600">₱{order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium capitalize">{order.status.toLowerCase()}</span>
              </div>
              {order.estimatedWaitTime && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. Wait:</span>
                  <span className="font-medium">{order.estimatedWaitTime} minutes</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={onBackToMenu}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Place New Order
            </button>
            
            <p className="text-sm text-gray-500 text-center">
              Your order has been placed successfully and will be prepared shortly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
