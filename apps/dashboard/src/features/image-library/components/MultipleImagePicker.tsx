import React, { useState } from "react";
import { PhotoIcon, FolderOpenIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useImagesQuery } from "../hooks/useImagesQuery";
import { useUploadImage } from "../hooks/useUploadImage";
import { ImageLibraryModal } from "./ImageLibraryModal";
import { toast } from "sonner";

interface MultipleImagePickerProps {
  value: string[]; // Array of image URLs
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export const MultipleImagePicker: React.FC<MultipleImagePickerProps> = ({
  value,
  onChange,
  maxImages = 10,
}) => {
  const [showLibrary, setShowLibrary] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { data: images, isLoading } = useImagesQuery();
  const uploadMutation = useUploadImage();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - value.length;
    if (remainingSlots <= 0) {
      toast.warning(`Maximum ${maxImages} images allowed`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploading(true);

    try {
      const uploadedUrls: string[] = [];
      for (const file of filesToUpload) {
        const uploaded = await uploadMutation.mutateAsync(file);
        uploadedUrls.push(uploaded.url);
      }
      onChange([...value, ...uploadedUrls]);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload one or more images. Please try again.");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleSelectFromLibrary = (url: string) => {
    if (value.length >= maxImages) {
      toast.warning(`Maximum ${maxImages} images allowed`);
      return;
    }
    if (!value.includes(url)) {
      onChange([...value, url]);
    }
    setShowLibrary(false);
  };

  const handleRemoveImage = (index: number) => {
    const newUrls = [...value];
    newUrls.splice(index, 1);
    onChange(newUrls);
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= value.length) return;
    const newUrls = [...value];
    const [movedItem] = newUrls.splice(fromIndex, 1);
    newUrls.splice(toIndex, 0, movedItem);
    onChange(newUrls);
  };

  return (
    <div>
      {/* Image Grid */}
      {value.length > 0 && (
        <div className="mb-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {value.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative group aspect-square rounded border border-gray-300 overflow-hidden bg-gray-50"
            >
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Image Controls */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center gap-2">
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                  title="Remove image"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>

                {/* Move Left */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleMoveImage(index, index - 1)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-xs"
                    title="Move left"
                  >
                    ←
                  </button>
                )}

                {/* Move Right */}
                {index < value.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleMoveImage(index, index + 1)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-xs"
                    title="Move right"
                  >
                    →
                  </button>
                )}
              </div>

              {/* Image Number Badge */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Text */}
      <p className="text-sm text-gray-600 mb-2">
        {value.length} / {maxImages} images
        {value.length > 0 && " • First image will be the primary image"}
      </p>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setShowLibrary(true)}
          disabled={isLoading || value.length >= maxImages}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FolderOpenIcon className="w-4 h-4" />
          Choose from Library
        </button>

        <label
          className={`flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer ${
            value.length >= maxImages || uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <PhotoIcon className="w-4 h-4" />
          {uploading ? "Uploading..." : "Upload New"}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading || value.length >= maxImages}
          />
        </label>

        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

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

