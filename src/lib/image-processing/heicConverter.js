/**
 * HEIC/HEIF Detection and Client-side Conversion Helper
 */

/**
 * Checks if a file is in HEIC or HEIF format
 * @param {File} file 
 * @returns {boolean}
 */
export function isHEIC(file) {
  if (!file) return false;
  
  // Check mime-type
  const mimeType = file.type?.toLowerCase();
  if (mimeType === 'image/heic' || mimeType === 'image/heif') {
    return true;
  }
  
  // Check extension as fallback
  const extension = file.name?.split('.').pop()?.toLowerCase();
  return extension === 'heic' || extension === 'heif';
}

/**
 * Converts a HEIC/HEIF file to a standard JPEG file
 * @param {File} file 
 * @returns {Promise<File>}
 */
export async function convertHEIC(file) {
  if (!isHEIC(file)) {
    return file;
  }

  try {
    console.log("HEIC file detected. Attempting client-side conversion using heic2any...");
    
    // Dynamically import heic2any so it's only loaded when needed
    const heic2anyModule = await import('heic2any');
    const heic2any = heic2anyModule.default || heic2anyModule;

    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.85
    });

    const resultBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    
    const newFileName = file.name.substring(0, file.name.lastIndexOf('.')) + '.jpg';
    
    return new File([resultBlob], newFileName, {
      type: 'image/jpeg',
      lastModified: new Date().getTime()
    });
  } catch (error) {
    console.error("HEIC conversion failed:", error);
    // Return a reject promise with a clean message so the UI can catch it and display a friendly notice
    throw new Error("HEIC/HEIF conversion failed. HEIC support is currently experimental. Please upload a standard JPG or PNG file instead.");
  }
}
