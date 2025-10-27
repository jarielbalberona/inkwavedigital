import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CategorySidebar } from "./CategorySidebar";
import { MenuGrid } from "./MenuGrid";
import { FloatingCartButton } from "../../cart/components/FloatingCartButton";
import { CartDrawer } from "../../cart/components/CartDrawer";
import { OrderConfirmation } from "../../order/components/OrderConfirmation";
import { PaxPrompt } from "../../qr/components/PaxPrompt";
import { useMenuQuery } from "../hooks/queries/useMenuQuery";
import { useCategoriesQuery } from "../hooks/queries/useCategoriesQuery";
import { useSessionStore } from "../hooks/stores/useSessionStore";
import { useCartStore } from "../../cart/hooks/stores/useCartStore";
import { getCategoriesFromItems } from "../hooks/helpers/menuHelpers";
import type { OrderConfirmation as OrderConfirmationType } from "../../order/types/order.types";

export const MenuPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmationType | null>(null);
  const [showPaxPrompt, setShowPaxPrompt] = useState(false);
  
  const { venueId, tableId, tableLabel, pax, clearSession, setSession, setPax } = useSessionStore();

  // Check for required query params and handle session setup
  useEffect(() => {
    const venueParam = searchParams.get('venue');
    const tableParam = searchParams.get('table');
    const labelParam = searchParams.get('label');
    
    // If there are query params, set session from them
    if (venueParam && tableParam && !venueId) {
      setSession(venueParam, tableParam, undefined, undefined, labelParam || undefined);
      // If no pax is set yet, show the pax prompt
      if (!pax) {
        setShowPaxPrompt(true);
      }
    }
    
    // If no session and no query params, redirect to homepage
    if (!venueParam && !tableParam && !venueId) {
      navigate('/', { replace: true });
    }
  }, [venueId, searchParams, setSession, navigate, pax]);
  
  const { data: menuData, isLoading: isMenuLoading, error } = useMenuQuery({
    venueId: venueId || "",
    availableOnly: true,
  });

  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategoriesQuery(venueId || "");

  const items = menuData?.items || [];
  // Use API categories if available, otherwise fall back to generating from items
  const categories = categoriesData || getCategoriesFromItems(items);
  const isLoading = isMenuLoading || isCategoriesLoading;

  // Set first category as active when data loads
  useEffect(() => {
    if (categories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategoryId(categoryId);
  };

  const handlePaxConfirm = (confirmedPax: number) => {
    setPax(confirmedPax);
    setShowPaxPrompt(false);
  };

  const handlePaxSkip = () => {
    setShowPaxPrompt(false);
  };

  const handleCheckout = (orderData: any) => {
    // This will be called after successful order submission
    setIsCartOpen(false);
    // Use the actual order data from the API
    setOrderConfirmation({
      orderId: orderData.orderId,
      status: orderData.status || "NEW",
      total: orderData.total || 0,
      createdAt: orderData.createdAt || new Date().toISOString(),
    });
  };

  const handleBackToMenu = () => {
    setOrderConfirmation(null);
  };

  // Show pax prompt if needed
  if (showPaxPrompt && tableId) {
    return (
      <PaxPrompt
        tableId={tableLabel || tableId}
        onConfirm={handlePaxConfirm}
        onSkip={handlePaxSkip}
      />
    );
  }

  // Show order confirmation if available
  if (orderConfirmation) {
    return (
      <OrderConfirmation
        order={orderConfirmation}
        onBackToMenu={handleBackToMenu}
      />
    );
  }

  if (isLoading || !categories.length) {
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
            venueId={venueId || ""}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-3 md:p-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Menu</h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm md:text-base text-gray-600">
                    {tableId ? tableLabel || `Table ${tableId.slice(-1)}` : "Choose your favorite items"}
                  </p>
                  {pax && (
                    <button
                      onClick={() => setShowPaxPrompt(true)}
                      className="text-sm md:text-base text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      • {pax} {pax === 1 ? 'person' : 'people'}
                    </button>
                  )}
                  {tableId && !pax && (
                    <button
                      onClick={() => setShowPaxPrompt(true)}
                      className="text-sm md:text-base text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      • Add party size
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  clearSession();
                  // Clear cart as well
                  useCartStore.getState().clearCart();
                }}
                className="text-gray-500 hover:text-gray-700 p-2"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
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
