import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTenantInfo } from "@/hooks/useTenantInfo";
import { EditTenantInfoModal } from "./EditTenantInfoModal";
import { TenantLogoUpload } from "./TenantLogoUpload";
import { PencilIcon } from "@heroicons/react/24/outline";

export const InfoTab: React.FC = () => {
  const { tenantInfo } = useTenantInfo();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!tenantInfo) {
    return (
      <div className="p-6">
        <p>Loading...</p>
      </div>
    );
  }

  const logoUrl = tenantInfo.settings?.branding?.logoUrl;

  return (
    <>
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Branding</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Tenant Logo (Square)
            </label>
            <p className="text-sm text-muted-foreground mb-3">
              Upload a square logo that will appear in the customer menu sidebar
            </p>
            <TenantLogoUpload currentLogoUrl={logoUrl} />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Tenant Information</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Tenant Name
            </label>
            <p className="mt-1 text-lg">{tenantInfo.name}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Slug
            </label>
            <p className="mt-1 text-lg font-mono">{tenantInfo.slug}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Used in customer-facing URLs
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Tenant ID
            </label>
            <p className="mt-1 text-sm font-mono text-muted-foreground">
              {tenantInfo.id}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Created
            </label>
            <p className="mt-1 text-sm">
              {new Date(tenantInfo.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Last Updated
            </label>
            <p className="mt-1 text-sm">
              {new Date(tenantInfo.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </Card>

      <EditTenantInfoModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        tenantInfo={tenantInfo}
      />
    </>
  );
};

