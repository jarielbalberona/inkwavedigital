import React, { useState } from "react";
import { PhotoIcon, FolderOpenIcon } from "@heroicons/react/24/outline";
import { useImagesQuery } from "../hooks/useImagesQuery";
import { useUploadImage } from "../hooks/useUploadImage";
import { ImageLibraryModal } from "./ImageLibraryModal";

interface ImagePickerProps {
  value?: string; // Current image URL
  onChange: (url: string) => void;
  type: "icon" | "image"; // Icon for categories, image for menu items
}

export const ImagePicker: React.FC<ImagePickerProps> = ({ value, onChange, type }) => {
  const [showLibrary, setShowLibrary] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { data: images, isLoading } = useImagesQuery();
  const uploadMutation = useUploadImage();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploaded = await uploadMutation.mutateAsync(file);
      onChange(uploaded.url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const isUrl = value && value.startsWith("http");

  return (
    <div>
      {/* Current Image Preview */}
      {value && isUrl && (
        <div className="mb-3">
          <img
            src={value}
            alt="Preview"
            className={`object-cover rounded border border-gray-300 ${
              type === "icon" ? "w-16 h-16" : "w-32 h-32"
            }`}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowLibrary(true)}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FolderOpenIcon className="w-4 h-4" />
          Choose from Library
        </button>

        <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
          <PhotoIcon className="w-4 h-4" />
          {uploading ? "Uploading..." : "Upload New"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </label>

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Image Library Modal */}
      {showLibrary && (
        <ImageLibraryModal
          images={images || []}
          onSelect={(url) => {
            onChange(url);
            setShowLibrary(false);
          }}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </div>
  );
};

