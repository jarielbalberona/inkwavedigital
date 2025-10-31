import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PhotoIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { useTenantId } from "@/hooks/useTenantId";
import { useUpdateSettings } from "../hooks/useUpdateSettings";
import { useUploadImage } from "@/features/image-library/hooks/useUploadImage";
import { ImageLibraryModal } from "@/features/image-library/components/ImageLibraryModal";
import { useImagesQuery } from "@/features/image-library/hooks/useImagesQuery";
import { useTenantInfo } from "@/hooks/useTenantInfo";

interface TenantLogoUploadProps {
  currentLogoUrl?: string;
}

export const TenantLogoUpload: React.FC<TenantLogoUploadProps> = ({
  currentLogoUrl,
}) => {
  const { tenantId } = useTenantId();
  const { tenantInfo } = useTenantInfo();
  const updateSettings = useUpdateSettings();
  const uploadMutation = useUploadImage();
  const { data: images, isLoading: isLoadingImages } = useImagesQuery();
  
  const [uploading, setUploading] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      // Upload image
      const uploaded = await uploadMutation.mutateAsync(file);
      
      // Update tenant settings with new logo URL
      await saveLogo(uploaded.url);
      
      toast.success("Logo uploaded successfully!");
      setImageError(false);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload logo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const saveLogo = async (logoUrl: string) => {
    if (!tenantId) return;

    // Merge with existing settings
    const currentSettings = tenantInfo?.settings || {};
    
    await updateSettings.mutateAsync({
      tenantId,
      settings: {
        ...currentSettings,
        branding: {
          ...currentSettings.branding,
          logoUrl,
        },
      },
    });
  };

  const handleSelectFromLibrary = async (url: string) => {
    try {
      await saveLogo(url);
      toast.success("Logo updated successfully!");
      setShowLibrary(false);
      setImageError(false);
    } catch (error) {
      console.error("Failed to update logo:", error);
      toast.error("Failed to update logo. Please try again.");
    }
  };

  const handleRemoveLogo = async () => {
    if (!tenantId) return;

    try {
      const currentSettings = tenantInfo?.settings || {};
      
      await updateSettings.mutateAsync({
        tenantId,
        settings: {
          ...currentSettings,
          branding: {
            ...currentSettings.branding,
            logoUrl: undefined,
          },
        },
      });
      
      toast.success("Logo removed successfully!");
    } catch (error) {
      console.error("Failed to remove logo:", error);
      toast.error("Failed to remove logo. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Logo Preview */}
      {currentLogoUrl && !imageError && (
        <div className="relative w-32 h-32 border-2 border-border rounded-lg overflow-hidden bg-muted">
          <img
            src={currentLogoUrl}
            alt="Tenant logo"
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {/* Placeholder when no logo */}
      {(!currentLogoUrl || imageError) && (
        <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted">
          <PhotoIcon className="w-12 h-12 text-muted-foreground" />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowLibrary(true)}
          disabled={isLoadingImages || uploading}
        >
          <PhotoIcon className="w-4 h-4 mr-2" />
          Choose from Library
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          asChild
        >
          <label className="cursor-pointer">
            <PhotoIcon className="w-4 h-4 mr-2" />
            {uploading ? "Uploading..." : "Upload New"}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </Button>

        {currentLogoUrl && !imageError && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveLogo}
            disabled={updateSettings.isPending}
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Remove
          </Button>
        )}
      </div>

      {/* Hint */}
      <p className="text-xs text-muted-foreground">
        Recommended: Square image (e.g., 512x512px) in PNG or JPG format
      </p>

      {/* Image Library Modal */}
      {showLibrary && (
        <ImageLibraryModal
          images={images || []}
          onSelect={handleSelectFromLibrary}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </div>
  );
};

