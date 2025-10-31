import React from "react";
import { Card } from "@/components/ui/card";
import { CreditCardIcon } from "@heroicons/react/24/outline";

export const PaymentsTab: React.FC = () => {
  return (
    <Card className="p-6">
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CreditCardIcon className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Payment Settings</h3>
        <p className="text-muted-foreground max-w-md">
          Payment integration and billing settings will be available here.
          Configure payment methods, view invoices, and manage your
          subscription.
        </p>
        <p className="text-sm text-muted-foreground mt-4">Coming soon...</p>
      </div>
    </Card>
  );
};

