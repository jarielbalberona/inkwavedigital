import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tablesApi } from "../api/tablesApi";
import type { CreateTableInput } from "../types/table.types";

export function useCreateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTableInput) => tablesApi.createTable(data),
    onSuccess: (_, variables) => {
      // Invalidate tables query for the venue
      queryClient.invalidateQueries({ queryKey: ["tables", variables.venueId] });
    },
  });
}

