import React from "react";
import { useTenantId } from "@/hooks/useTenantId";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { InfoTab } from "./InfoTab";
import { PaymentsTab } from "./PaymentsTab";
import { AppearanceTab } from "./AppearanceTab";

export const SettingsPage: React.FC = () => {
  const { tenantId } = useTenantId();

  if (!tenantId) {
    return (
      <div className="p-6">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tenant Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your tenant configuration, payments, and appearance
        </p>
      </div>

      <Separator />

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <InfoTab />
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <PaymentsTab />
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <AppearanceTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

