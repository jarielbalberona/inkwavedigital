import { createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '../components/DashboardLayout';
import { VenueManagementPage } from '../features/venue-management/components/VenueManagementPage';
import { useUserRole } from '../hooks/useUserRole';

export const Route = createFileRoute('/venues')({
  component: () => {
    const { role, assignedVenueIds } = useUserRole();
    
    return (
      <DashboardLayout>
        <VenueManagementPage role={role} assignedVenueIds={assignedVenueIds} />
      </DashboardLayout>
    );
  },
});

