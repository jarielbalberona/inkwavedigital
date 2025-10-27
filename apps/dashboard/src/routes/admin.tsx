import { createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '../components/DashboardLayout';
import { TenantManagementPage } from '../features/admin/components/TenantManagementPage';
import { useSuperAdmin } from '../hooks/useSuperAdmin';

export const Route = createFileRoute('/admin')({
  component: () => {
    const { isSuperAdmin } = useSuperAdmin();
    
    if (!isSuperAdmin) {
      return null;
    }
    
    return (
      <DashboardLayout>
        <TenantManagementPage />
      </DashboardLayout>
    );
  },
});

