import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { tenantsApi } from "../api/tenantsApi";
import type { Tenant, CreateTenantInput } from "../types/admin.types";
import { slugify } from "../../../lib/slugify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";

interface TenantFormProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
  onSuccess: () => void;
}

export const TenantForm: React.FC<TenantFormProps> = ({
  isOpen,
  onClose,
  tenant,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    ownerEmail: "",
    addInitialVenue: false,
    venueName: "",
    venueSlug: "",
    venueAddress: "",
    venueTimezone: "Asia/Manila",
  });

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name,
        slug: tenant.slug,
        ownerEmail: "",
        addInitialVenue: false,
        venueName: "",
        venueSlug: "",
        venueAddress: "",
        venueTimezone: "Asia/Manila",
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        ownerEmail: "",
        addInitialVenue: false,
        venueName: "",
        venueSlug: "",
        venueAddress: "",
        venueTimezone: "Asia/Manila",
      });
    }
  }, [tenant, isOpen]);

  const createMutation = useMutation({
    mutationFn: (data: CreateTenantInput) => tenantsApi.createTenant(data),
    onSuccess: () => {
      onSuccess();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const input: CreateTenantInput = {
      name: formData.name,
      slug: formData.slug,
      ownerEmail: formData.ownerEmail || undefined,
      initialVenue: formData.addInitialVenue
        ? {
            name: formData.venueName,
            slug: formData.venueSlug,
            address: formData.venueAddress || undefined,
            timezone: formData.venueTimezone,
          }
        : undefined,
    };

    await createMutation.mutateAsync(input);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 gap-0">
        <DialogHeader className="p-6 border-b border-border">
          <DialogTitle>
            {tenant ? "Edit Tenant" : "Create Tenant"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-12rem)]">
          <div className="p-6 space-y-4">
            {/* Tenant Information */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Tenant Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tenant Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({ 
                        ...formData, 
                        name,
                        slug: slugify(name)
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slug: slugify(e.target.value),
                      })
                    }
                    placeholder="auto-generated-from-name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    pattern="^[a-z0-9-]+$"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-generated from tenant name (editable)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner Email *
                  </label>
                  <input
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    placeholder="owner@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email of the person who will manage this tenant
                  </p>
                </div>
              </div>
            </div>

            {/* Initial Venue */}
            <div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="addInitialVenue"
                  checked={formData.addInitialVenue}
                  onChange={(e) => setFormData({ ...formData, addInitialVenue: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="addInitialVenue" className="text-sm font-medium text-gray-700">
                  Add initial venue
                </label>
              </div>

              {formData.addInitialVenue && (
                <div className="bg-gray-50 p-4 rounded-md space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Venue Information</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Venue Name *
                    </label>
                    <input
                      type="text"
                      value={formData.venueName}
                      onChange={(e) => {
                        const venueName = e.target.value;
                        setFormData({ 
                          ...formData, 
                          venueName,
                          venueSlug: slugify(venueName)
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={formData.addInitialVenue}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Venue Slug *
                    </label>
                    <input
                      type="text"
                      value={formData.venueSlug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          venueSlug: slugify(e.target.value),
                        })
                      }
                      placeholder="auto-generated-from-venue-name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={formData.addInitialVenue}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-generated from venue name (editable)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.venueAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, venueAddress: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timezone
                    </label>
                    <select
                      value={formData.venueTimezone}
                      onChange={(e) => setFormData({ ...formData, venueTimezone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Asia/Manila">Asia/Manila</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="America/Los_Angeles">America/Los_Angeles</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="Asia/Singapore">Asia/Singapore</option>
                    </select>
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
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create Tenant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

