import React, { useState, useEffect } from "react";
import { CategorySidebar } from "./CategorySidebar";
import { MenuGrid } from "./MenuGrid";
import { FloatingCartButton } from "../../cart/components/FloatingCartButton";
import { CartDrawer } from "../../cart/components/CartDrawer";
import { OrderConfirmation } from "../../order/components/OrderConfirmation";
import { useMenuQuery } from "../hooks/queries/useMenuQuery";
import { useSessionStore } from "../hooks/stores/useSessionStore";
import { getCategoriesFromItems } from "../hooks/helpers/menuHelpers";
import type { OrderConfirmation as OrderConfirmationType } from "../../order/types/order.types";

export const MenuPage: React.FC = () => {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmationType | null>(null);
  
  const { venueId } = useSessionStore();
  
  const { data: menuData, isLoading, error } = useMenuQuery({
    venueId: venueId || "",
    availableOnly: true,
  });

  const items = menuData?.items || [];
  const categories = getCategoriesFromItems(items);

  // Set first category as active when data loads
  useEffect(() => {
    if (categories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategoryId(categoryId);
  };

  const handleCheckout = () => {
    // This will be called after successful order submission
    setIsCartOpen(false);
    // For now, create a mock order confirmation
    setOrderConfirmation({
      orderId: `ORD-${Date.now()}`,
      status: "NEW",
      total: 0, // Will be set by the actual order
      createdAt: new Date().toISOString(),
    });
  };

  const handleBackToMenu = () => {
    setOrderConfirmation(null);
  };

  // Show order confirmation if available
  if (orderConfirmation) {
    return (
      <OrderConfirmation
        order={orderConfirmation}
        onBackToMenu={handleBackToMenu}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load menu</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!venueId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please scan a QR code to view the menu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`${isSidebarCollapsed ? "w-20 md:w-20" : "w-20 md:w-64"} transition-all duration-300`}>
          <CategorySidebar
            categories={categories}
            activeCategoryId={activeCategoryId}
            onCategorySelect={handleCategorySelect}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-3 md:p-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Menu</h1>
            <p className="text-sm md:text-base text-gray-600">Choose your favorite items</p>
          </div>

          {/* Menu Grid */}
          <MenuGrid
            items={items}
            categories={categories}
            activeCategoryId={activeCategoryId}
            onCategoryChange={setActiveCategoryId}
          />
        </div>
      </div>

      {/* Floating Cart Button */}
      <FloatingCartButton onClick={() => setIsCartOpen(true)} />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />
    </div>
  );
};
