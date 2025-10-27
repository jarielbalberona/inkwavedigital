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
  createdAt: string;
}

