import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTenantId } from "@/hooks/useTenantId";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

interface EditTenantInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantInfo: TenantInfo;
}

export const EditTenantInfoModal: React.FC<EditTenantInfoModalProps> = ({
  isOpen,
  onClose,
  tenantInfo,
}) => {
  const { tenantId } = useTenantId();
  const queryClient = useQueryClient();
  const [name, setName] = useState(tenantInfo.name);
  const [slug, setSlug] = useState(tenantInfo.slug);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName(tenantInfo.name);
    setSlug(tenantInfo.slug);
  }, [tenantInfo]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(generateSlug(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Tenant name is required");
      return;
    }

    if (!slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.patch(`/api/v1/admin/tenants/${tenantId}`, {
        name: name.trim(),
        slug: slug.trim(),
      });

      // Invalidate tenant info query to refetch
      queryClient.invalidateQueries({ queryKey: ["tenant-info"] });

      toast.success("Tenant information updated successfully!");
      onClose();
    } catch (error: any) {
      console.error("Failed to update tenant info:", error);
      toast.error(
        error.response?.data?.error || "Failed to update tenant information"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Tenant Information</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tenant Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter tenant name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="tenant-slug"
                required
              />
              <p className="text-sm text-muted-foreground">
                Used in customer-facing URLs. Only lowercase letters, numbers,
                and hyphens.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

