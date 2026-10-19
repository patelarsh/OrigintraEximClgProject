import React, { useState } from 'react';
import { getProductImageSources, handleImageFallback } from '../utils/productImage';

interface ProductImageProps {
  src: string;
  alt: string;
  productName: string;
  productId?: string;
  category?: string;
  className?: string;
  eager?: boolean;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  productName,
  productId,
  category = 'Indian Spices',
  className = 'w-full h-full object-cover transition-transform duration-500 group-hover:scale-105',
  eager = false
}) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const img = getProductImageSources(src);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100">
      {/* Skeleton Shimmer Background while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-200/60 animate-pulse pointer-events-none" />
      )}

      <picture className="w-full h-full block">
        {img.w450Src && (
          <source
            type="image/webp"
            media="(max-width: 640px)"
            srcSet={img.w450Src}
          />
        )}
        {img.webpSrc && (
          <source
            type="image/webp"
            srcSet={img.webpSrc}
          />
        )}
        <img
          src={img.src}
          data-base-jpg={img.src}
          alt={alt}
          width="400"
          height="500"
          loading={eager ? 'eager' : 'lazy'}
          decoding={eager ? 'sync' : 'async'}
          onLoad={() => setIsLoaded(true)}
          onError={(e) => {
            setIsLoaded(true);
            handleImageFallback(e, productName, category, productId);
          }}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        />
      </picture>
    </div>
  );
};
