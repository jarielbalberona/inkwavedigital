import { useMutation, useQueryClient } from "@tanstack/react-query";
import { imagesApi } from "../api/imagesApi";

export const useUploadImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => imagesApi.uploadImage(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
};

