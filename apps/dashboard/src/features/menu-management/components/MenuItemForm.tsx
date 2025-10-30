import React, { useState, useEffect } from "react";
import { useCreateMenuItem, useUpdateMenuItem } from "../hooks/mutations";
import type { MenuItem, CreateMenuItemInput, UpdateMenuItemInput } from "../types/menuManagement.types";
import { MultipleImagePicker } from "../../image-library/components/MultipleImagePicker";
import { ItemOptionsManager } from "./ItemOptionsManager";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Checkbox } from "../../../components/ui/checkbox";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
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
    imageUrls: [] as string[],
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
        imageUrls: item.imageUrls || [],
        isAvailable: item.isAvailable ?? true,
      });
    } else {
      // Reset form for new item
      setFormData({
        name: "",
        description: "",
        price: 0,
        imageUrls: [],
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 gap-0">
        <DialogHeader className="p-6 border-b border-border">
          <DialogTitle>
            {item ? "Edit Menu Item" : "Add Menu Item"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="p-6 space-y-4">
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
              <Label>Item Images (Max 10)</Label>
              <MultipleImagePicker
                value={formData.imageUrls}
                onChange={(urls) => setFormData({ ...formData, imageUrls: urls })}
                maxImages={10}
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
            <div className="border-t border-border pt-6">
              {item ? (
                <ItemOptionsManager itemId={item.id} />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-foreground">Item Options / Modifiers</h3>
                  </div>
                  <div className="text-center py-8 bg-primary/10 rounded-lg border-2 border-dashed border-primary/30">
                    <p className="text-sm text-foreground mb-1">
                      Options can be added after creating the item
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Save this item first, then edit it to add options like Size, Add-ons, or Customizations
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 border-t border-border">
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
