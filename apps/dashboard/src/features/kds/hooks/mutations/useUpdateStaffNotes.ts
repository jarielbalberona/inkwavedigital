import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "../../api/ordersApi";
import type { UpdateStaffNotesInput } from "../../types/kds.types";

export const useUpdateStaffNotes = (venueId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateStaffNotesInput) => ordersApi.updateStaffNotes(input),
    onSuccess: () => {
      // Invalidate orders query to refetch with updated staff notes
      queryClient.invalidateQueries({ queryKey: ["orders", venueId] });
    },
  });
};

