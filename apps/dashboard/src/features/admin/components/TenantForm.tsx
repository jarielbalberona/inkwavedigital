import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useMutation } from "@tanstack/react-query";
import { tenantsApi } from "../api/tenantsApi";
import type { Tenant, CreateTenantInput } from "../types/admin.types";

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {tenant ? "Edit Tenant" : "Create Tenant"}
            </h2>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                      })
                    }
                    placeholder="lowercase-letters-numbers-hyphens"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    pattern="^[a-z0-9-]+$"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Only lowercase letters, numbers, and hyphens allowed
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
                      onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
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
                          venueSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={formData.addInitialVenue}
                    />
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

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createMutation.isPending ? "Creating..." : "Create Tenant"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

