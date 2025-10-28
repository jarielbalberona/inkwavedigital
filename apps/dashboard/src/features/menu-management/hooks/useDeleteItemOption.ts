import { useMutation, useQueryClient } from "@tanstack/react-query";
import { itemOptionsApi } from "../api/itemOptionsApi";

export const useDeleteItemOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (optionId: string) => itemOptionsApi.deleteItemOption(optionId),
    onSuccess: () => {
      // Invalidate all item options queries
      queryClient.invalidateQueries({ queryKey: ["itemOptions"] });
    },
  });
};

