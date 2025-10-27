import { useQuery } from "@tanstack/react-query";
import { tablesApi } from "../api/tablesApi";
import type { Table } from "../types/table.types";

export const useTablesQuery = (venueId: string) => {
  return useQuery({
    queryKey: ["tables", venueId],
    queryFn: async (): Promise<Table[]> => {
      const response = await tablesApi.getTables(venueId);
      return response.tables;
    },
    enabled: !!venueId,
  });
};
