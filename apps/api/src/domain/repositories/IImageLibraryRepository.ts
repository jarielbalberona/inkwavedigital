export interface ImageLibraryItem {
  id: string;
  tenantId: string;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl: string | null;
  size: number;
  mimeType: string;
  width: number | null;
  height: number | null;
  uploadedBy: string | null;
  createdAt: Date;
}

export interface IImageLibraryRepository {
  save(image: Omit<ImageLibraryItem, "id" | "createdAt">): Promise<ImageLibraryItem>;
  findByTenantId(tenantId: string): Promise<ImageLibraryItem[]>;
  findById(id: string): Promise<ImageLibraryItem | null>;
  delete(id: string): Promise<void>;
}

