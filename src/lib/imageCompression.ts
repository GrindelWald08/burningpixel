/**
 * Compresses an image file to reduce file size while maintaining quality
 * @param file - The image file to compress
 * @param maxWidth - Maximum width in pixels (default: 1200)
 * @param maxHeight - Maximum height in pixels (default: 1200)
 * @param quality - JPEG/WebP quality 0-1 (default: 0.8)
 * @returns Compressed image as a File object
 */
export const compressImage = (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Skip compression for non-image files
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    // Skip compression for SVGs (they're already optimized vectors)
    if (file.type === 'image/svg+xml') {
      resolve(file);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Draw image with high-quality smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to WebP for best compression (with JPEG fallback)
      const outputType = 'image/webp';

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            // Fallback to JPEG if WebP fails
            canvas.toBlob(
              (jpegBlob) => {
                if (!jpegBlob) {
                  reject(new Error('Failed to compress image'));
                  return;
                }
                const baseName = file.name.replace(/\.[^/.]+$/, '');
                const fallbackFile = new File([jpegBlob], `${baseName}.jpg`, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(fallbackFile);
              },
              'image/jpeg',
              quality
            );
            return;
          }

          // Generate new filename with webp extension
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const newFileName = `${baseName}.webp`;

          const compressedFile = new File([blob], newFileName, {
            type: outputType,
            lastModified: Date.now(),
          });

          // Only use compressed version if it's smaller
          if (compressedFile.size < file.size) {
            console.log(
              `Image compressed to WebP: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB (${Math.round((1 - compressedFile.size / file.size) * 100)}% reduction)`
            );
            resolve(compressedFile);
          } else {
            console.log('Original image is already optimized, skipping compression');
            resolve(file);
          }
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    // Load image from file
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };
    reader.readAsDataURL(file);
  });
};
