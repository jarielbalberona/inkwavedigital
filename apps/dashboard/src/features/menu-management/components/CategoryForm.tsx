import React, { useState, useEffect } from "react";
import { useCreateCategory, useUpdateCategory } from "../hooks/mutations";
import type { MenuCategory, CreateCategoryInput, UpdateCategoryInput } from "../types/menuManagement.types";
import { CategoryIconPicker } from "./CategoryIconPicker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  category?: MenuCategory;
  venueId: string;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  isOpen,
  onClose,
  category,
  venueId,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    iconUrl: "",
    sortIndex: 0,
  });

  // Update form data when category changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: category?.name || "",
        iconUrl: category?.iconUrl || "",
        sortIndex: category?.sortIndex || 0,
      });
    }
  }, [category, isOpen]);

  const createCategoryMutation = useCreateCategory(venueId);
  const updateCategoryMutation = useUpdateCategory(venueId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (category) {
      // Update existing category
      const updateData: UpdateCategoryInput = {
        id: category.id,
        ...formData,
      };
      await updateCategoryMutation.mutateAsync(updateData);
    } else {
      // Create new category
      const createData: CreateCategoryInput = {
        ...formData,
      };
      await createCategoryMutation.mutateAsync(createData);
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "Add Category"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Category Icon</Label>
            <CategoryIconPicker
              value={formData.iconUrl}
              onChange={(url) => setFormData({ ...formData, iconUrl: url })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortIndex">Sort Order</Label>
            <Input
              id="sortIndex"
              type="number"
              value={formData.sortIndex}
              onChange={(e) => setFormData({ ...formData, sortIndex: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
            >
              {createCategoryMutation.isPending || updateCategoryMutation.isPending
                ? "Saving..."
                : category
                ? "Update"
                : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
