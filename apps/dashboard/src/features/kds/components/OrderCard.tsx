import React, { useState, useEffect } from "react";
import { ClockIcon, UserIcon, UserGroupIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { useUpdateOrderStatus } from "../hooks/mutations/useUpdateOrderStatus";
import { useUpdateStaffNotes } from "../hooks/mutations/useUpdateStaffNotes";
import { getStatusColor, getNextStatus, formatOrderTime, formatOrderTotal, getTimeElapsed } from "../hooks/helpers/orderHelpers";
import type { Order, SelectedOption } from "../types/kds.types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";

interface OrderCardProps {
  order: Order;
  venueId: string;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, venueId }) => {
  const updateOrderStatusMutation = useUpdateOrderStatus(venueId);
  const updateStaffNotesMutation = useUpdateStaffNotes(venueId);
  const nextStatus = getNextStatus(order.status);
  const [timeElapsed, setTimeElapsed] = useState(getTimeElapsed(order.createdAt));
  const [staffNotes, setStaffNotes] = useState(order.staffNotes || "");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  // Update elapsed time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(getTimeElapsed(order.createdAt));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [order.createdAt]);

  // Update staff notes state when order changes
  useEffect(() => {
    setStaffNotes(order.staffNotes || "");
  }, [order.staffNotes]);

  const handleStatusUpdate = (newStatus: string) => {
    updateOrderStatusMutation.mutate({
      orderId: order.id,
      newStatus,
    });
  };

  const handleCancelOrder = () => {
    updateOrderStatusMutation.mutate({
      orderId: order.id,
      newStatus: "CANCELLED",
      cancellationReason: cancellationReason || undefined,
    });
    setShowCancelDialog(false);
    setCancellationReason("");
  };

  const handleSaveStaffNotes = () => {
    updateStaffNotesMutation.mutate({
      orderId: order.id,
      staffNotes,
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</h3>
          <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              {formatOrderTime(order.createdAt)}
            </div>
            <div className="text-xs font-medium text-orange-600">
              {timeElapsed}
            </div>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      {/* Table/Device Info and Pax */}
      <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
        <div className="flex items-center">
          <UserIcon className="w-4 h-4 mr-1" />
          {order.tableLabel || (order.tableId ? `Table ${order.tableId}` : `Device ${order.deviceId.slice(0, 8)}`)}
        </div>
        {order.pax && (
          <div className="flex items-center">
            <UserGroupIcon className="w-4 h-4 mr-1" />
            {order.pax} {order.pax === 1 ? 'guest' : 'guests'}
          </div>
        )}
      </div>

      {/* Order Notes */}
      {order.notes && (
        <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
          <div className="flex items-start text-sm">
            <DocumentTextIcon className="w-4 h-4 mr-1 text-blue-600 flex-shrink-0 mt-0.5" />
            <span className="text-blue-900 font-medium">Order Note: </span>
            <span className="text-blue-800 ml-1">{order.notes}</span>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="space-y-3 mb-4">
        {order.items.map((item) => {
          let parsedOptions: SelectedOption[] = [];
          try {
            if (item.optionsJson) {
              // Handle multiple possible formats
              if (typeof item.optionsJson === 'string') {
                // If it's a JSON string, parse it
                parsedOptions = JSON.parse(item.optionsJson);
              } else if (Array.isArray(item.optionsJson)) {
                // If it's already an array, use it directly
                parsedOptions = item.optionsJson as SelectedOption[];
              } else if (typeof item.optionsJson === 'object') {
                // If it's an object but not an array, it might be a single option
                // or malformed data - wrap it in an array
                console.warn('Unexpected optionsJson format:', item.optionsJson);
              }
            }
          } catch (e) {
            console.error("Failed to parse options JSON", e, item.optionsJson);
          }

          // Ensure parsedOptions is always an array
          if (!Array.isArray(parsedOptions)) {
            parsedOptions = [];
          }

          return (
            <div key={item.id} className="border-b border-gray-100 pb-2 last:border-b-0">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-gray-900 font-medium text-base">
                    {item.quantity}x {item.name}
                  </div>
                  
                  {/* Display selected options/modifiers */}
                  {parsedOptions.length > 0 && (
                    <div className="mt-1.5 ml-4 space-y-1">
                      {parsedOptions.map((option, idx) => (
                        <div key={idx} className="text-sm text-gray-700">
                          <span className="font-medium text-gray-600">{option.optionName}:</span>{" "}
                          <span className="text-gray-800">
                            {option.values.map((value, vIdx) => (
                              <span key={vIdx}>
                                {value.valueLabel}
                                {value.priceDelta !== 0 && (
                                  <span className="text-green-700 font-medium">
                                    {" "}(+₱{value.priceDelta.toFixed(2)})
                                  </span>
                                )}
                                {vIdx < option.values.length - 1 && ", "}
                              </span>
                            ))}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Display item notes */}
                  {item.notes && (
                    <div className="mt-1.5 ml-4 p-2 bg-yellow-50 rounded border border-yellow-200">
                      <div className="text-sm text-yellow-900">
                        <span className="font-medium">Special Instructions: </span>
                        <span className="italic">{item.notes}</span>
                      </div>
                    </div>
                  )}
                </div>
                <span className="font-medium text-gray-900 ml-3 text-base whitespace-nowrap">
                  {formatOrderTotal(item.totalPrice)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="border-t border-gray-200 pt-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">Total:</span>
          <span className="font-bold text-lg text-green-600">
            {formatOrderTotal(order.total)}
          </span>
        </div>
      </div>

      {/* Staff Notes */}
      <div className="border-t border-gray-200 pt-4 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Staff Notes (Internal)
        </label>
        <textarea
          value={staffNotes}
          onChange={(e) => setStaffNotes(e.target.value)}
          placeholder="Add internal notes about this order..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
        />
        <button
          onClick={handleSaveStaffNotes}
          disabled={updateStaffNotesMutation.isPending || staffNotes === order.staffNotes}
          className="mt-2 w-full bg-gray-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {updateStaffNotesMutation.isPending ? "Saving..." : "Save Staff Notes"}
        </button>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        {nextStatus && (
          <button
            onClick={() => handleStatusUpdate(nextStatus)}
            disabled={updateOrderStatusMutation.isPending}
            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {updateOrderStatusMutation.isPending ? "Updating..." : `Mark as ${nextStatus}`}
          </button>
        )}
        
        {order.status !== "CANCELLED" && order.status !== "READY" && order.status !== "SERVED" && (
          <button
            onClick={() => setShowCancelDialog(true)}
            disabled={updateOrderStatusMutation.isPending}
            className="bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Reason (Optional)
            </label>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          <DialogFooter>
            <button
              onClick={() => {
                setShowCancelDialog(false);
                setCancellationReason("");
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Keep Order
            </button>
            <button
              onClick={handleCancelOrder}
              disabled={updateOrderStatusMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {updateOrderStatusMutation.isPending ? "Cancelling..." : "Cancel Order"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
