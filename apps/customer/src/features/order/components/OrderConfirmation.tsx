import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { OrderConfirmation } from "../types/order.types";

interface OrderConfirmationProps {
  order: OrderConfirmation;
  onBackToMenu: () => void;
  onViewOrders: () => void;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  order,
  onBackToMenu,
  onViewOrders,
}) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="text-center p-8">
          <CheckCircleIcon className="w-16 h-16 text-success mx-auto mb-4" />
          
          <h1 className="text-2xl font-bold text-foreground mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-6">Your order has been placed successfully</p>

          <div className="bg-muted rounded-lg p-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-medium">{order.orderId.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-bold text-success">₱{order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium capitalize">{order.status.toLowerCase()}</span>
              </div>
              {order.estimatedWaitTime && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Wait:</span>
                  <span className="font-medium">{order.estimatedWaitTime} minutes</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onViewOrders}
              className="w-full"
              size="lg"
            >
              View Orders
            </Button>
            
            <Button
              onClick={onBackToMenu}
              variant="secondary"
              className="w-full"
              size="lg"
            >
              Place New Order
            </Button>
            
            <p className="text-sm text-muted-foreground text-center">
              Your order has been placed successfully and will be prepared shortly.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
