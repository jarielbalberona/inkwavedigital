import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tablesApi } from "../api/tablesApi";

export function useDeleteTable(venueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tableId: string) => tablesApi.deleteTable(tableId),
    onSuccess: () => {
      // Invalidate tables query for the venue
      queryClient.invalidateQueries({ queryKey: ["tables", venueId] });
    },
  });
}

