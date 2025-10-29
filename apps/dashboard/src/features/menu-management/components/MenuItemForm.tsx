import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useCreateMenuItem, useUpdateMenuItem } from "../hooks/mutations";
import type { MenuItem, CreateMenuItemInput, UpdateMenuItemInput } from "../types/menuManagement.types";
import { ImagePicker } from "../../image-library/components/ImagePicker";
import { ItemOptionsManager } from "./ItemOptionsManager";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Checkbox } from "../../../components/ui/checkbox";
import { Button } from "../../../components/ui/button";
import CurrencyInput from "react-currency-input-field";

interface MenuItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  item?: MenuItem;
  categoryId: string;
}

export const MenuItemForm: React.FC<MenuItemFormProps> = ({
  isOpen,
  onClose,
  item,
  categoryId,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    isAvailable: true,
  });

  const createMenuItemMutation = useCreateMenuItem(categoryId);
  const updateMenuItemMutation = useUpdateMenuItem(categoryId);

  // Update form data when item changes (for editing)
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        description: item.description || "",
        price: item.price || 0,
        imageUrl: item.imageUrl || "",
        isAvailable: item.isAvailable ?? true,
      });
    } else {
      // Reset form for new item
      setFormData({
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        isAvailable: true,
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (item) {
      // Update existing item
      const updateData: UpdateMenuItemInput = {
        id: item.id,
        ...formData,
      };
      await updateMenuItemMutation.mutateAsync(updateData);
    } else {
      // Create new item
      const createData: CreateMenuItemInput = {
        categoryId,
        ...formData,
      };
      await createMenuItemMutation.mutateAsync(createData);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h2 className="text-lg font-semibold text-gray-900">
              {item ? "Edit Menu Item" : "Add Menu Item"}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (₱)</Label>
              <CurrencyInput
                id="price"
                name="price"
                placeholder="0.00"
                value={formData.price}
                decimalsLimit={2}
                onValueChange={(value) => setFormData({ ...formData, price: parseFloat(value || "0") })}
                prefix="₱"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Item Image</Label>
              <ImagePicker
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                type="image"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAvailable"
                checked={formData.isAvailable}
                onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked as boolean })}
              />
              <Label
                htmlFor="isAvailable"
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Available for ordering
              </Label>
            </div>

            {/* Options Section */}
            <div className="border-t border-gray-200 pt-6">
              {item ? (
                <ItemOptionsManager itemId={item.id} />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">Item Options / Modifiers</h3>
                  </div>
                  <div className="text-center py-8 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300">
                    <p className="text-sm text-gray-700 mb-1">
                      Options can be added after creating the item
                    </p>
                    <p className="text-xs text-gray-500">
                      Save this item first, then edit it to add options like Size, Add-ons, or Customizations
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMenuItemMutation.isPending || updateMenuItemMutation.isPending}
              >
                {createMenuItemMutation.isPending || updateMenuItemMutation.isPending
                  ? "Saving..."
                  : item
                  ? "Update"
                  : "Create"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
