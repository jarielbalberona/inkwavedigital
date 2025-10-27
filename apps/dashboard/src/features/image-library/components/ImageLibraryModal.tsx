import React, { useState } from "react";
import { XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { ImageLibraryItem } from "../types/image.types";
import { useDeleteImage } from "../hooks/useDeleteImage";

interface ImageLibraryModalProps {
  images: ImageLibraryItem[];
  onSelect: (url: string) => void;
  onClose: () => void;
}

export const ImageLibraryModal: React.FC<ImageLibraryModalProps> = ({
  images,
  onSelect,
  onClose,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const deleteImageMutation = useDeleteImage();

  const handleDelete = async (e: React.MouseEvent, imageId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this image?")) {
      await deleteImageMutation.mutateAsync(imageId);
    }
  };

  const handleSelect = () => {
    if (selectedImage) {
      onSelect(selectedImage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Image Library</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Image Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {images.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No images uploaded yet
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === image.url
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedImage(image.url)}
                  >
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={image.thumbnailUrl || image.url}
                        alt={image.originalName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDelete(e, image.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>

                    {/* Image info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="truncate">{image.originalName}</p>
                      <p className="text-gray-300">
                        {(image.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedImage}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Select Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

