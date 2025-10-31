import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CategorySidebar } from "./CategorySidebar";
import { MenuGrid } from "./MenuGrid";
import { FloatingCartButton } from "../../cart/components/FloatingCartButton";
import { CartDrawer } from "../../cart/components/CartDrawer";
import { OrderConfirmation } from "../../order/components/OrderConfirmation";
import { OrderStatusDrawer } from "../../order/components/OrderStatusDrawer";
import { PaxPrompt } from "../../qr/components/PaxPrompt";
import { useMenuQuery } from "../hooks/queries/useMenuQuery";
import { useCategoriesQuery } from "../hooks/queries/useCategoriesQuery";
import { useDeviceOrdersQuery } from "../../order/hooks/queries/useDeviceOrdersQuery";
import { useSessionStore } from "../hooks/stores/useSessionStore";
import { useCartStore } from "../../cart/hooks/stores/useCartStore";
import { getCategoriesFromItems } from "../hooks/helpers/menuHelpers";
import { venueApi } from "../api/venueApi";
import type { OrderConfirmation as OrderConfirmationType, ActiveOrder } from "../../order/types/order.types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { wsClient } from "@/lib/websocket";
import { notificationManager } from "@/lib/notifications";
import { applyTenantTheme } from "@/lib/themeLoader";

export const MenuPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const pathParams = useParams<{ tenantSlug?: string; venueSlug?: string }>();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderStatusOpen, setIsOrderStatusOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmationType | null>(null);
  const [showPaxPrompt, setShowPaxPrompt] = useState(false);
  
  const { venueId, tableId, tableLabel, pax, deviceId, clearSession, setSession, setPax } = useSessionStore();

  // Fetch venue by slugs if using new URL format
  const { data: venueBySlugData, isLoading: isLoadingVenueBySlug } = useQuery({
    queryKey: ["venueBySlug", pathParams.tenantSlug, pathParams.venueSlug],
    queryFn: () => venueApi.getVenueBySlug(pathParams.tenantSlug!, pathParams.venueSlug!),
    enabled: !!(pathParams.tenantSlug && pathParams.venueSlug),
    staleTime: 0, // Always fetch fresh to reflect tenant theme changes immediately
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes for back navigation
  });

  // Fetch active orders for this device
  const { data: activeOrders = [], isLoading: isOrdersLoading } = useDeviceOrdersQuery(
    deviceId,
    venueId || undefined
  );

  // Check for required query params and handle session setup
  useEffect(() => {
    // New slug-based URL: /:tenantSlug/:venueSlug/menu?table=xxx&label=xxx
    if (pathParams.tenantSlug && pathParams.venueSlug && venueBySlugData) {
      const tableParam = searchParams.get('table');
      const labelParam = searchParams.get('label');
      
      if (tableParam) {
        const fetchedVenueId = venueBySlugData.venue.id;
        // If venue or table is different from stored session, replace the session
        if (fetchedVenueId !== venueId || tableParam !== tableId) {
          setSession(fetchedVenueId, tableParam, undefined, undefined, labelParam || undefined);
          // Always ask for pax when switching to a different table/venue
          setShowPaxPrompt(true);
        } else if (!pax) {
          // If same table but no pax set, ask for pax
          setShowPaxPrompt(true);
        }
      }
      return;
    }

    // Legacy UUID-based URL: /menu?venue=xxx&table=xxx&label=xxx
    const venueParam = searchParams.get('venue');
    const tableParam = searchParams.get('table');
    const labelParam = searchParams.get('label');
    
    // If there are query params, check if they match the current session
    if (venueParam && tableParam) {
      // If venue or table is different from stored session, replace the session
      if (venueParam !== venueId || tableParam !== tableId) {
        setSession(venueParam, tableParam, undefined, undefined, labelParam || undefined);
        // Always ask for pax when switching to a different table/venue
        setShowPaxPrompt(true);
      } else if (!pax) {
        // If same table but no pax set, ask for pax
        setShowPaxPrompt(true);
      }
      return;
    }
    
    // If no session and no query params, redirect to homepage
    if (!venueParam && !tableParam && !venueId && !pathParams.tenantSlug) {
      navigate('/', { replace: true });
    }
  }, [venueId, tableId, searchParams, setSession, navigate, pax, pathParams, venueBySlugData]);
  
  const { data: menuData, isLoading: isMenuLoading, error } = useMenuQuery({
    venueId: venueId || "",
    availableOnly: true,
  });

  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategoriesQuery(venueId || "");

  const items = menuData?.items || [];
  // Use API categories if available, otherwise fall back to generating from items
  const categories = categoriesData || getCategoriesFromItems(items);
  const isLoading = isMenuLoading || isCategoriesLoading || isLoadingVenueBySlug;

  // Set first category as active when data loads
  useEffect(() => {
    if (categories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  // Apply tenant theme when venue data is loaded
  useEffect(() => {
    if (venueBySlugData?.tenant?.settings) {
      applyTenantTheme(venueBySlugData.tenant.settings);
    }
  }, [venueBySlugData]);

  // WebSocket integration for real-time order updates
  useEffect(() => {
    if (!venueId) return;

    console.log("[MenuPage] Connecting to WebSocket for venue:", venueId);
    wsClient.connect(venueId);

    // Subscribe to WebSocket messages
    const unsubscribe = wsClient.subscribe((message) => {
      console.log("[MenuPage] WebSocket message received:", message.type);
      
      if (message.type === "order_created" || message.type === "order_status_changed") {
        // Invalidate device orders query to refetch with fresh data
        queryClient.invalidateQueries({ queryKey: ["device-orders", deviceId, venueId] });
      }
    });

    // Cleanup on unmount or venueId change
    return () => {
      console.log("[MenuPage] Cleaning up WebSocket connection");
      unsubscribe();
      wsClient.disconnect();
    };
  }, [venueId, deviceId, queryClient]);

  // Track previous orders to detect status changes
  const previousOrdersRef = useRef<Map<string, string>>(new Map());

  // Request notification permissions on mount (browser + audio + push)
  useEffect(() => {
    if (deviceId && venueId) {
      notificationManager.requestPermissions(deviceId, venueId);
    }
  }, [deviceId, venueId]);

  // Helper function to get status-specific notification messages
  const getStatusNotification = (status: string) => {
    switch (status) {
      case 'NEW':
        return {
          emoji: '📝',
          title: 'Order Received',
          description: 'Your order has been received',
          type: 'order-update' as const,
        };
      case 'PREPARING':
        return {
          emoji: '👨‍🍳',
          title: 'Order Being Prepared',
          description: 'Your order is being prepared',
          type: 'order-update' as const,
        };
      case 'READY':
        return {
          emoji: '🍽️',
          title: 'Order Ready!',
          description: 'Your order is ready for pickup!',
          type: 'order-ready' as const,
        };
      case 'SERVED':
        return {
          emoji: '✅',
          title: 'Order Served',
          description: 'Enjoy your meal!',
          type: 'order-update' as const,
        };
      default:
        return {
          emoji: '🔔',
          title: 'Order Updated',
          description: 'Your order status has been updated',
          type: 'order-update' as const,
        };
    }
  };

  // Detect order status changes and show notifications
  useEffect(() => {
    if (!activeOrders || activeOrders.length === 0) return;

    activeOrders.forEach((order: ActiveOrder) => {
      const previousStatus = previousOrdersRef.current.get(order.id);
      
      // Detect any status change (not just first time we see the order)
      if (previousStatus && previousStatus !== order.status) {
        const orderNumber = order.id.slice(0, 8);
        const notification = getStatusNotification(order.status);
        
        // Show toast notification with appropriate style
        const toastFn = order.status === 'READY' ? toast.success : toast.info;
        toastFn(notification.title, {
          description: `Order #${orderNumber} - ${notification.description}`,
          duration: order.status === 'READY' ? 15000 : 8000, // Longer for READY
        });

        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`${notification.emoji} ${notification.title}`, {
            body: `Order #${orderNumber}\n${notification.description}`,
            icon: '/icon.png',
            tag: `order-${order.id}`,
            requireInteraction: order.status === 'READY', // Only require interaction for READY
          });
        }

        // Play sound and vibrate
        notificationManager.notify(notification.type);
      }

      // Update the previous status
      previousOrdersRef.current.set(order.id, order.status);
    });

    // Clean up orders that are no longer active
    const activeOrderIds = new Set(activeOrders.map((o: ActiveOrder) => o.id));
    Array.from(previousOrdersRef.current.keys()).forEach((orderId) => {
      if (!activeOrderIds.has(orderId)) {
        previousOrdersRef.current.delete(orderId);
      }
    });
  }, [activeOrders]);

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

  const handleViewOrders = () => {
    setOrderConfirmation(null);
    setIsOrderStatusOpen(true);
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
        onViewOrders={handleViewOrders}
      />
    );
  }

  if (isLoading || !categories.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load menu</p>
          <Button
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!venueId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please scan a QR code to view the menu</p>
        </div>
      </div>
    );
  }

  const hasActiveOrders = activeOrders.length > 0;

  return (
    <div className="min-h-screen bg-background">
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
          <div className="bg-card border-b border-border p-3 md:p-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">Menu</h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm md:text-base text-muted-foreground">
                    {tableId ? tableLabel || `Table ${tableId.slice(-1)}` : "Choose your favorite items"}
                  </p>
                  {pax && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setShowPaxPrompt(true)}
                      className="text-sm md:text-base h-auto p-0"
                    >
                      • {pax} {pax === 1 ? 'person' : 'people'}
                    </Button>
                  )}
                  {tableId && !pax && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setShowPaxPrompt(true)}
                      className="text-sm md:text-base h-auto p-0"
                    >
                      • Add party size
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Order Status Button - Only show if there are active orders */}
              {hasActiveOrders && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOrderStatusOpen(true)}
                  className="relative"
                  title="View Orders"
                >
                  <ClipboardDocumentListIcon className="w-6 h-6" />
                  {/* Badge showing number of active orders */}
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0"
                  >
                    {activeOrders.length}
                  </Badge>
                </Button>
              )}
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

      {/* Order Status Drawer */}
      <OrderStatusDrawer
        isOpen={isOrderStatusOpen}
        onClose={() => setIsOrderStatusOpen(false)}
        orders={activeOrders}
        isLoading={isOrdersLoading}
      />
    </div>
  );
};
