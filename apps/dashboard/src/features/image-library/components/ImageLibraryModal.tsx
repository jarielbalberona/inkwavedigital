import React, { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import type { ImageLibraryItem } from "../types/image.types";
import { useDeleteImage } from "../hooks/useDeleteImage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const deleteImageMutation = useDeleteImage();

  const handleDelete = (e: React.MouseEvent, imageId: string) => {
    e.stopPropagation();
    setImageToDelete(imageId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (imageToDelete) {
      await deleteImageMutation.mutateAsync(imageToDelete);
      setShowDeleteDialog(false);
      setImageToDelete(null);
    }
  };

  const handleSelect = () => {
    if (selectedImage) {
      onSelect(selectedImage);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0 gap-0">
        <DialogHeader className="p-6 border-b border-border">
          <DialogTitle>Image Library</DialogTitle>
        </DialogHeader>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[calc(80vh-10rem)]">
          {images.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No images uploaded yet
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === image.url
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-border/80"
                  }`}
                  onClick={() => setSelectedImage(image.url)}
                >
                  <div className="aspect-square bg-muted">
                    <img
                      src={image.thumbnailUrl || image.url}
                      alt={image.originalName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(e, image.id)}
                    className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>

                  {/* Image info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm text-foreground text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="truncate">{image.originalName}</p>
                    <p className="text-muted-foreground">
                      {(image.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSelect}
            disabled={!selectedImage}
          >
            Select Image
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Delete Image Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

