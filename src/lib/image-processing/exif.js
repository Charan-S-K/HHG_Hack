/**
 * JPEG EXIF Orientation Parser
 */

/**
 * Extracts EXIF orientation tag from a JPEG image file
 * @param {File} file 
 * @returns {Promise<number>} Orientation tag value (1-8, -1 for not found, -2 for not JPEG)
 */
export function getExifOrientation(file) {
  return new Promise((resolve) => {
    if (!file || file.type !== 'image/jpeg') {
      return resolve(-2);
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const arrayBuffer = e.target?.result;
      if (!arrayBuffer) {
        return resolve(-1);
      }

      const view = new DataView(arrayBuffer);
      if (view.getUint16(0, false) !== 0xFFD8) {
        return resolve(-2); // Not a valid JPEG
      }

      const length = view.byteLength;
      let offset = 2;

      while (offset < length) {
        if (offset + 2 > length) break;
        const marker = view.getUint16(offset, false);
        
        if (marker === 0xFFE1) {
          // APP1 Marker (EXIF)
          if (offset + 12 > length) break;
          
          // Check for 'Exif' header
          if (view.getUint32(offset + 4, false) !== 0x45786966 || view.getUint16(offset + 8, false) !== 0) {
            return resolve(-1);
          }

          const littleEndian = view.getUint16(offset + 10, false) === 0x4949;
          const tiffHeaderOffset = offset + 10;
          
          if (offset + 18 > length) break;
          const ifd0Offset = view.getUint32(tiffHeaderOffset + 4, littleEndian);
          
          let directoryOffset = tiffHeaderOffset + ifd0Offset;
          if (directoryOffset + 2 > length) break;
          const entriesCount = view.getUint16(directoryOffset, littleEndian);
          
          directoryOffset += 2;
          for (let i = 0; i < entriesCount; i++) {
            const entryOffset = directoryOffset + i * 12;
            if (entryOffset + 12 > length) break;
            
            const tag = view.getUint16(entryOffset, littleEndian);
            if (tag === 0x0112) { // Orientation Tag
              const orientation = view.getUint16(entryOffset + 8, littleEndian);
              return resolve(orientation);
            }
          }
          break;
        } else if ((marker & 0xFF00) === 0xFF00) {
          // Other marker, skip it
          if (offset + 4 > length) break;
          offset += view.getUint16(offset + 2, false) + 2;
        } else {
          break;
        }
      }
      return resolve(-1);
    };

    // We only need the first 64KB for EXIF headers
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
  });
}

/**
 * Returns rotation degrees and scale factor to correct EXIF orientation in Canvas drawing
 * @param {number} orientation 
 * @returns {{rotateRad: number, scaleX: number, scaleY: number}}
 */
export function getOrientationTransform(orientation) {
  let rotateRad = 0;
  let scaleX = 1;
  let scaleY = 1;

  switch (orientation) {
    case 2:
      scaleX = -1;
      break;
    case 3:
      rotateRad = Math.PI;
      break;
    case 4:
      scaleY = -1;
      break;
    case 5:
      rotateRad = Math.PI / 2;
      scaleX = -1;
      break;
    case 6:
      rotateRad = Math.PI / 2; // 90 deg
      break;
    case 7:
      rotateRad = -Math.PI / 2;
      scaleX = -1;
      break;
    case 8:
      rotateRad = -Math.PI / 2; // 270 deg
      break;
    default:
      break;
  }

  return { rotateRad, scaleX, scaleY };
}
