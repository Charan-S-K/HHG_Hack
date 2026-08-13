/**
 * General utility helpers for HH Goa 2026 Identity Studio
 */

/**
 * Formats a file size in bytes to a human-readable string (e.g., KB, MB)
 * @param {number} bytes 
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generates a unique string identifier
 * @returns {string}
 */
export function generateUUID() {
  return Math.random().toString(36).substring(2, 9).toUpperCase();
}
