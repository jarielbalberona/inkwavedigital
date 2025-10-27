import { api } from "../../../lib/api";
import type { ImageLibraryItem } from "../types/image.types";

export const imagesApi = {
  uploadImage: async (file: File): Promise<ImageLibraryItem> => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post<{ success: boolean; data: ImageLibraryItem }>("/api/v1/images/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getImages: async (): Promise<ImageLibraryItem[]> => {
    const response = await api.get<{ success: boolean; data: ImageLibraryItem[] }>("/api/v1/images");
    return response.data;
  },

  deleteImage: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/images/${id}`);
  },
};

