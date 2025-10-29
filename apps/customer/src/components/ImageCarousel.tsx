import React, { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  showDots?: boolean;
}

const DEFAULT_IMAGE =
  "https://pub-41bef80e05e044e8a7e02c461f986c84.r2.dev/a1088200-e822-4a1d-b796-ff6abf742155/1761589977537-wjwzl8.jpg";

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  alt,
  className = "",
  showDots = true,
}) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  // If no images, return placeholder
  if (!images || images.length === 0) {
    return <img src={DEFAULT_IMAGE} alt={alt} className={className} loading="lazy" />;
  }

  // If only one image, no need for carousel controls
  if (images.length === 1) {
    return <img src={images[0]} alt={alt} className={className} loading="lazy" />;
  }

  return (
    <div className="relative group">
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <img
                src={image}
                alt={`${alt} - Image ${index + 1}`}
                className={className}
                loading="lazy"
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Buttons */}
        <CarouselPrevious className="left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white border-0 hover:bg-black/70" />
        <CarouselNext className="right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white border-0 hover:bg-black/70" />
      </Carousel>

      {/* Image Counter Badge */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded z-10">
        {current} / {count}
      </div>

      {/* Dots Indicator */}
      {showDots && count > 1 && count <= 10 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                api?.scrollTo(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === current - 1
                  ? "bg-white w-4"
                  : "bg-white bg-opacity-50 hover:bg-opacity-75"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

