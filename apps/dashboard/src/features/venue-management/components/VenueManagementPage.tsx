import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { venuesApi } from "../api/venuesApi";
import { useTenantId } from "../../../hooks/useTenantId";
import { useState, useMemo } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { slugify } from "../../../lib/slugify";

interface VenueManagementPageProps {
  role: "owner" | "manager" | null;
  assignedVenueIds: string[];
}

export function VenueManagementPage({ role, assignedVenueIds }: VenueManagementPageProps) {
  const { tenantId, isLoading: isLoadingTenant } = useTenantId();
  const [showForm, setShowForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState<venuesApi.Venue | null>(null);
  const queryClient = useQueryClient();

  const { data: venuesData, isLoading } = useQuery({
    queryKey: ["venues", tenantId],
    queryFn: async () => {
      if (!tenantId) throw new Error("No tenant ID");
      return venuesApi.getVenues(tenantId);
    },
    enabled: !!tenantId,
  });

  // Filter venues based on user role
  const filteredVenues = useMemo(() => {
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

  const createMutation = useMutation({
    mutationFn: async (data: venuesApi.CreateVenueInput) => {
      if (!tenantId) throw new Error("No tenant ID");
      return venuesApi.createVenue(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ venueId, data }: { venueId: string; data: venuesApi.UpdateVenueInput }) => {
      return venuesApi.updateVenue(venueId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      setEditingVenue(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (venueId: string) => {
      return venuesApi.deleteVenue(venueId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
    },
  });

  if (isLoadingTenant) {
    return <div className="p-6">Loading...</div>;
  }

  if (!tenantId) {
    return <div className="p-6 text-red-600">No tenant ID found</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Venues</h2>
          {role && (
            <p className="text-sm text-gray-600">
              Role: <span className="font-medium capitalize">{role}</span>
            </p>
          )}
        </div>
        {!showForm && !editingVenue && role === "owner" && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <PlusIcon className="w-5 h-5" />
            Add Venue
          </button>
        )}
      </div>

      {showForm && (
        <VenueForm
          onSubmit={(data) => {
            createMutation.mutate(data);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingVenue && (
        <VenueForm
          venue={editingVenue}
          onSubmit={(data) => {
            updateMutation.mutate({ venueId: editingVenue.id, data });
          }}
          onCancel={() => setEditingVenue(null)}
        />
      )}

      {isLoading && <div className="text-gray-600">Loading venues...</div>}

      {filteredVenues.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {role === "manager" 
            ? "No venues assigned to you yet. Contact your owner to get access."
            : "No venues yet. Create one to get started."}
        </div>
      )}

      {filteredVenues.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVenues.map((venue) => (
            <div key={venue.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{venue.name}</h3>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Slug:</span> {venue.slug}
              </p>
              {venue.address && (
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Address:</span> {venue.address}
                </p>
              )}
              <p className="text-sm text-gray-600 mb-3">
                <span className="font-medium">Timezone:</span> {venue.timezone}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingVenue(venue)}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition"
                  disabled={role === "manager" && !assignedVenueIds.includes(venue.id)}
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit
                </button>
                {role === "owner" && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete venue "${venue.name}"?`)) {
                        deleteMutation.mutate(venue.id);
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface VenueFormProps {
  venue?: venuesApi.Venue;
  onSubmit: (data: venuesApi.CreateVenueInput) => void;
  onCancel: () => void;
}

function VenueForm({ venue, onSubmit, onCancel }: VenueFormProps) {
  const [name, setName] = useState(venue?.name || "");
  const [slug, setSlug] = useState(venue?.slug || "");
  const [address, setAddress] = useState(venue?.address || "");
  const [timezone, setTimezone] = useState(venue?.timezone || "Asia/Manila");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      slug,
      address: address || undefined,
      timezone,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">{venue ? "Edit Venue" : "New Venue"}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              const newName = e.target.value;
              setName(newName);
              if (!venue) {
                setSlug(slugify(newName));
              }
            }}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            required
            disabled={!!venue}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
              venue 
                ? 'bg-gray-100 text-gray-600 cursor-not-allowed' 
                : 'focus:ring-2 focus:ring-purple-600 focus:border-transparent'
            }`}
          />
          <p className="text-xs text-gray-500 mt-1">
            {venue ? "Slug cannot be changed after creation" : "Auto-generated from venue name (editable)"}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          >
            <option value="Asia/Manila">Asia/Manila</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="America/Los_Angeles">America/Los_Angeles</option>
            <option value="Europe/London">Europe/London</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            {venue ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

