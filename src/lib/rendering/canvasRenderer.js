/**
 * HTML5 Canvas Rendering Pipeline for HH Goa 2026 Identity Studio
 */

import { FORMATS } from '../formats/formats';



/**
 * Draws the user photo with zoom and pan transformations into a specified bounding box.
 * Supports cover fitting and clipping.
 */
export function drawUserPhoto(ctx, img, x, y, width, height, zoom, panX, panY, clipShape = 'rect') {
  ctx.save();

  // Create clipping path if requested
  if (clipShape === 'circle') {
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height / 2, Math.min(width, height) / 2, 0, Math.PI * 2);
    ctx.clip();
  } else if (clipShape === 'rect') {
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
  }

  // Calculate cover dimensions
  const imgRatio = img.width / img.height;
  const targetRatio = width / height;
  
  let drawWidth = width;
  let drawHeight = height;

  if (imgRatio > targetRatio) {
    // Image is wider than target aspect ratio -> fit height
    drawHeight = height;
    drawWidth = height * imgRatio;
  } else {
    // Image is taller than target aspect ratio -> fit width
    drawWidth = width;
    drawHeight = width / imgRatio;
  }

  // Apply zoom
  const finalWidth = drawWidth * zoom;
  const finalHeight = drawHeight * zoom;

  // Center the image in the bounding box + apply pan offsets
  const drawX = x + (width - finalWidth) / 2 + panX;
  const drawY = y + (height - finalHeight) / 2 + panY;

  ctx.drawImage(img, drawX, drawY, finalWidth, finalHeight);
  ctx.restore();
}

/**
 * Draws a futuristic retro-grid background pattern.
 */
function drawTechGrid(ctx, x, y, width, height, cellSize = 50) {
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.04)';
  ctx.lineWidth = 1;

  // Vertical lines
  for (let l = x; l <= x + width; l += cellSize) {
    ctx.beginPath();
    ctx.moveTo(l, y);
    ctx.lineTo(l, y + height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let l = y; l <= y + height; l += cellSize) {
    ctx.beginPath();
    ctx.moveTo(x, l);
    ctx.lineTo(x + width, l);
    ctx.stroke();
  }

  // Diagonal tech line
  ctx.strokeStyle = 'rgba(255, 90, 95, 0.03)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + height * 0.7);
  ctx.lineTo(x + width, y + height * 0.2);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws a real, scanner-readable Code 39 barcode for the Builder ID Card.
 */
function drawBarcode(ctx, x, y, width, height, seedStr = 'HHG2026') {
  const CODE39_PATTERNS = {
    '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000',
    '4': '000110001', '5': '100110000', '6': '001110000', '7': '000100101',
    '8': '100100100', '9': '001100100', 'A': '100001001', 'B': '001001001',
    'C': '101001000', 'D': '000011001', 'E': '100011000', 'F': '001011000',
    'G': '000001101', 'H': '100001100', 'I': '001001100', 'J': '000011100',
    'K': '100000011', 'L': '001000011', 'M': '101000010', 'N': '000010011',
    'O': '100010010', 'P': '001010010', 'Q': '000000111', 'R': '100000110',
    'S': '001000110', 'T': '000010110', 'U': '110000001', 'V': '011000001',
    'W': '111000000', 'X': '010010001', 'Y': '110010000', 'Z': '011010000',
    '-': '010000101', '.': '110000100', ' ': '011000100', '$': '010101000',
    '/': '010100010', '+': '010001010', '%': '000101010', '*': '010010100'
  };

  const sanitized = seedStr.replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'PASS';
  const barcodeText = `HHG2026-${sanitized}-SECURE`;
  const barcodeData = `*${barcodeText}*`;

  ctx.save();
  // Clear the barcode region with a solid white background (critical for scanners)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x - 15, y - 5, width + 30, height + 10);

  const W_ratio = 2.0;
  const unitsPerChar = 3 * W_ratio + 6;
  const totalUnits = barcodeData.length * unitsPerChar + (barcodeData.length - 1);

  // Dynamically calculate N (narrow element width) to be at least 1 pixel
  let N = Math.floor(width / totalUnits);
  if (N < 1) N = 1;
  const W = W_ratio * N;

  const actualWidth = barcodeData.length * (3 * W + 6 * N) + (barcodeData.length - 1) * N;
  
  // Center the barcode inside the white rectangle
  const startX = x + (width - actualWidth) / 2;

  ctx.fillStyle = '#000000'; // Draw black bars on the white background
  let currentX = startX;

  for (let i = 0; i < barcodeData.length; i++) {
    const char = barcodeData[i];
    const pattern = CODE39_PATTERNS[char] || CODE39_PATTERNS[' '];

    for (let j = 0; j < 9; j++) {
      const isBar = (j % 2 === 0);
      const isWide = (pattern[j] === '1');
      const w = isWide ? W : N;

      if (isBar) {
        // Round to exact integer coordinates to prevent antialiasing blur
        const drawX = Math.round(currentX);
        const drawW = Math.round(currentX + w) - drawX;
        ctx.fillRect(drawX, y, drawW, height);
      }
      currentX += w;
    }

    if (i < barcodeData.length - 1) {
      currentX += N;
    }
  }

  ctx.restore();
}

/**
 * Renders the PFP Frame format onto the canvas.
 */
export function renderPfp(canvas, img, zoom, panX, panY) {
  canvas.width = FORMATS.PFP.width;
  canvas.height = FORMATS.PFP.height;
  const ctx = canvas.getContext('2d');

  // 1. Base dark background
  ctx.fillStyle = '#0A0B10';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. User photo in the center
  const padding = 60;
  const photoSize = canvas.width - padding * 2;
  if (img) {
    drawUserPhoto(
      ctx,
      img,
      padding,
      padding,
      photoSize,
      photoSize,
      zoom,
      panX,
      panY,
      'circle'
    );
  }

  // 3. Cyberpunk/Neon outer overlay frame
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = photoSize / 2;

  // Outer glow ring
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 10, 0, Math.PI * 2);
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#FF5A5F'); // Coral
  gradient.addColorStop(0.5, '#00F2FE'); // Teal
  gradient.addColorStop(1, '#A7FF37'); // Lime
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 12;
  ctx.shadowColor = 'rgba(0, 242, 254, 0.4)';
  ctx.shadowBlur = 20;
  ctx.stroke();
  ctx.restore();

  // Dark inner vignette ring to frame user photo
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - 4, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(10, 11, 16, 0.6)';
  ctx.lineWidth = 16;
  ctx.stroke();
  ctx.restore();

  // Technical crosshairs
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.6)';
  ctx.lineWidth = 2;
  
  // Top left notch
  ctx.beginPath();
  ctx.moveTo(centerX - radius - 15, centerY - 30);
  ctx.lineTo(centerX - radius - 15, centerY - 15);
  ctx.lineTo(centerX - radius - 30, centerY - 15);
  ctx.stroke();

  // Bottom right notch
  ctx.beginPath();
  ctx.moveTo(centerX + radius + 15, centerY + 30);
  ctx.lineTo(centerX + radius + 15, centerY + 15);
  ctx.lineTo(centerX + radius + 30, centerY + 15);
  ctx.stroke();

  // Text overlay: Top "HH GOA 2026"
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Dark background strip for text legibility
  ctx.fillStyle = 'rgba(10, 11, 16, 0.85)';
  ctx.fillRect(centerX - 180, centerY - radius - 28, 360, 56);
  ctx.strokeStyle = '#FF5A5F';
  ctx.lineWidth = 2;
  ctx.strokeRect(centerX - 180, centerY - radius - 28, 360, 56);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('HH GOA 2026', centerX, centerY - radius);
  ctx.restore();

  // Text overlay: Bottom "BUILDER"
  ctx.save();
  ctx.font = 'bold 32px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Bottom badge background
  ctx.fillStyle = 'rgba(10, 11, 16, 0.85)';
  ctx.fillRect(centerX - 140, centerY + radius - 26, 280, 52);
  ctx.strokeStyle = '#00F2FE';
  ctx.lineWidth = 2;
  ctx.strokeRect(centerX - 140, centerY + radius - 26, 280, 52);

  ctx.fillStyle = '#A7FF37'; // Lime accent
  ctx.fillText('B U I L D E R', centerX, centerY + radius);
  ctx.restore();
}

/**
 * Renders the Builder ID Card format onto the canvas.
 */
export function renderBuilderCard(canvas, img, zoom, panX, panY, options = {}) {
  canvas.width = FORMATS.BUILDER_CARD.width;
  canvas.height = FORMATS.BUILDER_CARD.height;
  const ctx = canvas.getContext('2d');

  const {
    name = 'BUILDER #404',
    role = 'HACKER',
    github = '',
    status = 'VERIFIED PASS',
    title = ''
  } = options;

  const displayName = (name || 'BUILDER #404').toUpperCase();
  const displayRole = (role || 'HACKER / BUILDER').toUpperCase();
  const displayGithub = github ? `@${github.replace(/^@/, '')}` : '@hhgoa2026';

  // 1. Draw base dark background
  ctx.fillStyle = '#0A0B10';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Draw tech grid
  drawTechGrid(ctx, 0, 0, canvas.width, canvas.height, 50);

  // 3. Draw card border / neon accents
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 20;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  ctx.strokeStyle = 'rgba(255, 90, 95, 0.5)'; // Coral inner border
  ctx.lineWidth = 2;
  ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);
  ctx.restore();

  // 4. Header: "HH GOA 2026"
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 50px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HH GOA 2026', canvas.width / 2, 95);

  ctx.fillStyle = '#00F2FE'; // Teal subheader
  ctx.font = 'bold 22px "Space Mono", monospace';
  ctx.fillText('BUILDER IDENTITY STUDIO', canvas.width / 2, 135);
  ctx.restore();

  // 5. Draw Photo Slot container
  const photoX = 175;
  const photoY = 180;
  const photoWidth = 450;
  const photoHeight = 490;

  // Background placeholder for photo
  ctx.fillStyle = '#12141E';
  ctx.fillRect(photoX, photoY, photoWidth, photoHeight);

  if (img) {
    drawUserPhoto(
      ctx,
      img,
      photoX,
      photoY,
      photoWidth,
      photoHeight,
      zoom,
      panX,
      panY,
      'rect'
    );
  } else {
    // Futuristic avatar placeholder
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, photoY + photoHeight / 2 - 20, 90, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(canvas.width / 2, photoY + photoHeight / 2 + 160, 140, Math.PI, Math.PI * 2);
    ctx.stroke();
  }

  // Photo frame border
  ctx.save();
  ctx.strokeStyle = '#00F2FE';
  ctx.lineWidth = 3;
  ctx.strokeRect(photoX, photoY, photoWidth, photoHeight);

  // Technical corners on photo frame
  ctx.fillStyle = '#FF5A5F';
  ctx.fillRect(photoX - 6, photoY - 6, 20, 6);
  ctx.fillRect(photoX - 6, photoY - 6, 6, 20);

  ctx.fillRect(photoX + photoWidth - 14, photoY - 6, 20, 6);
  ctx.fillRect(photoX + photoWidth, photoY - 6, 6, 20);

  ctx.fillRect(photoX - 6, photoY + photoHeight, 20, 6);
  ctx.fillRect(photoX - 6, photoY + photoHeight - 14, 6, 20);

  ctx.fillRect(photoX + photoWidth - 14, photoY + photoHeight, 20, 6);
  ctx.fillRect(photoX + photoWidth, photoY + photoHeight - 14, 6, 20);
  ctx.restore();

  // 6. Draw Details Panel (Lower half)
  const detailsY = 730;
  
  // Custom separator line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, detailsY);
  ctx.lineTo(canvas.width - 50, detailsY);
  ctx.stroke();

  // Meta details left side
  ctx.save();
  ctx.textAlign = 'left';

  // Label Name
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = 'bold 15px "Space Mono", monospace';
  ctx.fillText('IDENTITY NAME //', 65, detailsY + 45);

  // Name value (auto-scale font size if long)
  ctx.fillStyle = '#FFFFFF';
  let nameFontSize = 36;
  ctx.font = `800 ${nameFontSize}px "Outfit", sans-serif`;
  while (ctx.measureText(displayName).width > 420 && nameFontSize > 20) {
    nameFontSize -= 2;
    ctx.font = `800 ${nameFontSize}px "Outfit", sans-serif`;
  }
  ctx.fillText(displayName, 65, detailsY + 85);

  // Label Role (Row 2)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = 'bold 15px "Space Mono", monospace';
  ctx.fillText('STACK / ROLE //', 65, detailsY + 135);

  // Role value (auto-scale font size if long - max width expanded to 670px)
  ctx.fillStyle = '#A7FF37'; // Lime accent
  let roleFontSize = 24;
  ctx.font = `bold ${roleFontSize}px "Space Mono", monospace`;
  while (ctx.measureText(displayRole).width > 670 && roleFontSize > 14) {
    roleFontSize -= 1;
    ctx.font = `bold ${roleFontSize}px "Space Mono", monospace`;
  }
  ctx.fillText(displayRole, 65, detailsY + 172);

  // Builder Title (Row 3 - Left aligned)
  if (title) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 15px "Space Mono", monospace';
    ctx.fillText('BUILDER TITLE //', 65, detailsY + 220);

    ctx.fillStyle = '#FF5A5F'; // Coral accent
    let titleFontSize = 22;
    ctx.font = `bold ${titleFontSize}px "Space Mono", monospace`;
    while (ctx.measureText(title).width > 670 && titleFontSize > 14) {
      titleFontSize -= 1;
      ctx.font = `bold ${titleFontSize}px "Space Mono", monospace`;
    }
    ctx.fillText(title, 65, detailsY + 258);
  }

  // GitHub handle (Row 4 - Left)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = 'bold 15px "Space Mono", monospace';
  ctx.fillText('GITHUB //', 65, detailsY + 305);
  ctx.fillStyle = '#00F2FE'; // Teal accent
  let ghFontSize = 20;
  ctx.font = `bold ${ghFontSize}px "Space Mono", monospace`;
  while (ctx.measureText(displayGithub).width > 320 && ghFontSize > 12) {
    ghFontSize -= 1;
    ctx.font = `bold ${ghFontSize}px "Space Mono", monospace`;
  }
  ctx.fillText(displayGithub, 65, detailsY + 342);

  // Meta details right side: Status (Row 1 - Right)
  ctx.textAlign = 'right';

  // Status block
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = 'bold 15px "Space Mono", monospace';
  ctx.fillText('STATUS //', canvas.width - 65, detailsY + 45);

  // Verified Badge (Lime)
  ctx.fillStyle = '#A7FF37';
  ctx.font = '800 22px "Outfit", sans-serif';
  ctx.fillText(status, canvas.width - 65, detailsY + 85);
  
  // Status indicator circle
  ctx.fillStyle = '#A7FF37';
  ctx.beginPath();
  const textLen = ctx.measureText(status).width;
  ctx.arc(canvas.width - 65 - textLen - 16, detailsY + 77, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 7. Draw Barcode at bottom right (Row 4 - Right)
  const barcodeWidth = 320;
  const barcodeHeight = 60;
  const barcodeX = canvas.width - 65 - barcodeWidth;
  const barcodeY = detailsY + 295;

  drawBarcode(ctx, barcodeX, barcodeY, barcodeWidth, barcodeHeight, displayName);
  
  // Barcode alphanumeric string
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.font = '12px "Space Mono", monospace';
  ctx.textAlign = 'center';
  const cleanDisplayName = displayName.replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'PASS';
  ctx.fillText(`HHG2026-${cleanDisplayName}-SECURE`, barcodeX + barcodeWidth / 2, barcodeY + barcodeHeight + 18);
  ctx.restore();
}
