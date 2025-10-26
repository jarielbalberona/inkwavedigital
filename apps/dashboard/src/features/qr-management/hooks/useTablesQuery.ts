import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";

export interface Table {
  id: string;
  label: string;
  venueId: string;
  qrCode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VenueTablesResponse {
  tables: Table[];
  total: number;
}

export const useTablesQuery = (venueId: string) => {
  return useQuery({
    queryKey: ["tables", venueId],
    queryFn: async (): Promise<Table[]> => {
      const response = await api.get<VenueTablesResponse>(`/api/v1/venues/${venueId}/tables`);
      return response.data.tables;
    },
    enabled: !!venueId,
  });
};
