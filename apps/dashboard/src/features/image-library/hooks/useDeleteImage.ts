import { useMutation, useQueryClient } from "@tanstack/react-query";
import { imagesApi } from "../api/imagesApi";

export const useDeleteImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => imagesApi.deleteImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
};

