import { useQuery } from "@tanstack/react-query";
import { itemOptionsApi } from "../api/itemOptionsApi";

export const useItemOptionsQuery = (itemId: string | undefined) => {
  return useQuery({
    queryKey: ["itemOptions", itemId],
    queryFn: () => {
      if (!itemId) {
        return Promise.resolve({ options: [] });
      }
      return itemOptionsApi.getItemOptions(itemId);
    },
    enabled: !!itemId,
  });
};

