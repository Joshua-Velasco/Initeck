import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file before upload.
 * Optimized for mobile uploads (maxStartWidth: 1920, maxStartHeight: 1920)
 * 
 * @param {File} imageFile - The file object from input type="file"
 * @param {Object} options - Custom options to override defaults
 * @returns {Promise<File>} Compressed file
 */
export const compressImage = async (imageFile, options = {}) => {
  if (!imageFile || !imageFile.type.startsWith('image/')) {
    console.warn('⚠️ CompressImage: File is not an image', imageFile);
    return imageFile;
  }

  // Default options optimized for mobile performance
  const defaultOptions = {
    maxSizeMB: 1,           // Max size ~1MB
    maxWidthOrHeight: 1920, // Max dimension (FHD)
    useWebWorker: true,     // Use a separate thread to avoid freezing UI
    fileType: 'image/jpeg', // Normalize to JPEG
    initialQuality: 0.8,
    ...options
  };

  try {
    console.log(`🖼️ Compressing ${imageFile.name} (${(imageFile.size / 1024 / 1024).toFixed(2)} MB)...`);
    const compressedFile = await imageCompression(imageFile, defaultOptions);
    console.log(`✅ Compressed to ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
    
    return compressedFile;
  } catch (error) {
    console.error('❌ compression failed', error);
    return imageFile; // Return original if compression fails
  }
};
