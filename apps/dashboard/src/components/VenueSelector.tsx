import { useQuery } from "@tanstack/react-query";
import { venuesApi } from "../features/venue-management/api/venuesApi";
import { useTenantId } from "../hooks/useTenantId";
import { useMemo, useEffect } from "react";

interface VenueSelectorProps {
  selectedVenueId: string | null;
  onVenueChange: (venueId: string) => void;
  role: "owner" | "manager" | null;
  assignedVenueIds: string[];
}

export function VenueSelector({ selectedVenueId, onVenueChange, role, assignedVenueIds }: VenueSelectorProps) {
  const { tenantId, isLoading: isLoadingTenant } = useTenantId();

  const { data: venuesData, isLoading } = useQuery({
    queryKey: ["venues", tenantId],
    queryFn: async () => {
      if (!tenantId) throw new Error("No tenant ID");
      return venuesApi.getVenues(tenantId);
    },
    enabled: !!tenantId,
  });

  // Filter venues based on user role
  const venues = useMemo(() => {
    if (!venuesData) return [];
    
    // Owners see all venues
    if (role === "owner") {
      return venuesData.venues;
    }
    
    // Managers see only assigned venues
    if (role === "manager" && assignedVenueIds.length > 0) {
      return venuesData.venues.filter((venue) => assignedVenueIds.includes(venue.id));
    }
    
    return venuesData.venues;
  }, [venuesData, role, assignedVenueIds]);

  useEffect(() => {
    if (!selectedVenueId && venues.length > 0) {
      onVenueChange(venues[0].id);
    }
  }, [selectedVenueId, venues, onVenueChange]);

  if (isLoadingTenant || isLoading) {
    return <div className="text-sm text-gray-600">Loading venues...</div>;
  }

  if (!venues || venues.length === 0) {
    return (
      <div className="text-sm text-red-600">
        No venues available. Please create a venue first.
      </div>
    );
  }

  return (
    <select
      value={selectedVenueId || ""}
      onChange={(e) => onVenueChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-600 focus:border-transparent"
    >
      {venues.map((venue) => (
        <option key={venue.id} value={venue.id}>
          {venue.name}
        </option>
      ))}
    </select>
  );
}
