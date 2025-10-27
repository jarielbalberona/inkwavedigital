import { createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '../components/DashboardLayout';
import { KDSPage } from '../features/kds/components/KDSPage';
import { VenueSelector } from '../components/VenueSelector';
import { useUserRole } from '../hooks/useUserRole';
import { useSearch } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/kds')({
  component: () => {
    const { role, assignedVenueIds } = useUserRole();
    const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
    
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <VenueSelector 
              selectedVenueId={selectedVenueId} 
              onVenueChange={setSelectedVenueId}
              role={role}
              assignedVenueIds={assignedVenueIds}
            />
          </div>
          {selectedVenueId ? (
            <KDSPage venueId={selectedVenueId} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Please select a venue to view KDS</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  },
});

