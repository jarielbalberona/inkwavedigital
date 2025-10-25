import { useQuery } from "@tanstack/react-query";
import { tablesApi } from "../../api/tablesApi";

export const useTablesQuery = (venueId: string) => {
  return useQuery({
    queryKey: ["tables", venueId],
    queryFn: () => tablesApi.getTables(venueId),
    enabled: !!venueId,
  });
};
