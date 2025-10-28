import { useMutation, useQueryClient } from "@tanstack/react-query";
import { itemOptionsApi } from "../api/itemOptionsApi";

export const useDeleteOptionValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (valueId: string) => itemOptionsApi.deleteOptionValue(valueId),
    onSuccess: () => {
      // Invalidate all item options queries to refresh values
      queryClient.invalidateQueries({ queryKey: ["itemOptions"] });
    },
  });
};

