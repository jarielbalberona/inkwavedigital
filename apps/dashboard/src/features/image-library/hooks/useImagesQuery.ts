import { useQuery } from "@tanstack/react-query";
import { imagesApi } from "../api/imagesApi";

export const useImagesQuery = () => {
  return useQuery({
    queryKey: ["images"],
    queryFn: () => imagesApi.getImages(),
  });
};

