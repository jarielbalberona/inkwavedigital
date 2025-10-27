import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tablesApi } from "../api/tablesApi";
import type { UpdateTableInput } from "../types/table.types";

export function useUpdateTable(venueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTableInput) => tablesApi.updateTable(data),
    onSuccess: () => {
      // Invalidate tables query for the venue
      queryClient.invalidateQueries({ queryKey: ["tables", venueId] });
    },
  });
}

