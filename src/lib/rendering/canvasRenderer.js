/**
 * HTML5 Canvas Rendering Pipeline
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
  // Note: panX and panY should be scaled according to zoom if we want fine control
  const drawX = x + (width - finalWidth) / 2 + panX;
  const drawY = y + (height - finalHeight) / 2 + panY;

  ctx.drawImage(img, drawX, drawY, finalWidth, finalHeight);
  ctx.restore();
}

/**
 * Draws a futuristic retro-grid background pattern.
 */
function drawTechGrid(ctx, x, y, width, height, cellSize = 40) {
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
 * Draws a procedural barcode for the Builder ID Card.
 */
function drawBarcode(ctx, x, y, width, height) {
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  
  let currentX = x;
  const endX = x + width;
  
  while (currentX < endX) {
    const barWidth = Math.random() > 0.4 ? (Math.random() > 0.5 ? 4 : 2) : 1;
    const spaceWidth = Math.random() > 0.4 ? (Math.random() > 0.5 ? 3 : 1) : 2;
    
    if (currentX + barWidth <= endX) {
      ctx.fillRect(currentX, y, barWidth, height);
    }
    currentX += barWidth + spaceWidth;
  }
  ctx.restore();
}

/**
 * Renders the PFP Frame format onto the canvas.
 */
export function renderPfp(canvas, img, zoom, panX, panY) {
  const format = FORMATS.PFP;
  canvas.width = format.width;
  canvas.height = format.height;
  const ctx = canvas.getContext('2d');

  // 1. Draw base dark background
  ctx.fillStyle = '#0A0B10';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Draw user photo in the center
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

  // 3. Draw Cyberpunk/Neon outer overlay frame
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

  // Draw technical crosshairs
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
  
  // Paint subtle dark background strip for text legibility
  ctx.fillStyle = 'rgba(10, 11, 16, 0.85)';
  ctx.fillRect(centerX - 180, centerY - radius - 26, 360, 52);
  ctx.strokeStyle = '#FF5A5F';
  ctx.lineWidth = 2;
  ctx.strokeRect(centerX - 180, centerY - radius - 26, 360, 52);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('HH GOA 2026', centerX, centerY - radius);
  ctx.restore();

  // Text overlay: Bottom "BUILDER"
  ctx.save();
  ctx.font = 'bold 32px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Paint bottom badge background
  ctx.fillStyle = 'rgba(10, 11, 16, 0.85)';
  ctx.fillRect(centerX - 140, centerY + radius - 24, 280, 48);
  ctx.strokeStyle = '#00F2FE';
  ctx.lineWidth = 2;
  ctx.strokeRect(centerX - 140, centerY + radius - 24, 280, 48);

  ctx.fillStyle = '#A7FF37'; // Lime accent
  ctx.fillText('B U I L D E R', centerX, centerY + radius);
  ctx.restore();
}

/**
 * Renders the Builder ID Card format onto the canvas.
 */
export function renderBuilderCard(canvas, img, zoom, panX, panY, options = {}) {
  const format = FORMATS.BUILDER_CARD;
  canvas.width = format.width;
  canvas.height = format.height;
  const ctx = canvas.getContext('2d');

  const {
    name = 'BUILDER #404',
    role = 'HACKER',
    github = 'github-user',
    status = 'VERIFIED'
  } = options;

  // 1. Draw base dark background
  ctx.fillStyle = '#0A0B10';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Draw tech grid
  drawTechGrid(ctx, 0, 0, canvas.width, canvas.height, 50);

  // 3. Draw card boarder / neon accents
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
  const photoY = 190;
  const photoWidth = 450;
  const photoHeight = 500;

  // Draw background shadow placeholder for photo
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
    // If no image, draw a futuristic avatar placeholder
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
  const detailsY = 750;
  
  // Custom design lines
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
  ctx.font = 'bold 16px "Space Mono", monospace';
  ctx.fillText('IDENTITY NAME //', 75, detailsY + 50);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 38px "Outfit", sans-serif';
  ctx.fillText(name, 75, detailsY + 95);

  // Label Role
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = 'bold 16px "Space Mono", monospace';
  ctx.fillText('ASSIGNED ROLE //', 75, detailsY + 160);
  ctx.fillStyle = '#A7FF37'; // Lime accent
  ctx.font = 'bold 28px "Space Mono", monospace';
  ctx.fillText(role, 75, detailsY + 200);

  // GitHub user details
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = 'bold 16px "Space Mono", monospace';
  ctx.fillText('GITHUB //', 75, detailsY + 260);
  ctx.fillStyle = '#00F2FE'; // Teal accent
  ctx.font = 'bold 22px "Space Mono", monospace';
  ctx.fillText(`@${github}`, 75, detailsY + 295);

  // Meta details right side: Status and barcode
  ctx.textAlign = 'right';

  // Status block
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = 'bold 16px "Space Mono", monospace';
  ctx.fillText('STATUS //', canvas.width - 75, detailsY + 50);

  // Verified Badge (Lime)
  ctx.fillStyle = '#A7FF37';
  ctx.font = '800 24px "Outfit", sans-serif';
  ctx.fillText(status, canvas.width - 75, detailsY + 90);
  
  // Small flashing status circle indicator next to text
  ctx.fillStyle = '#A7FF37';
  ctx.beginPath();
  const textLen = ctx.measureText(status).width;
  ctx.arc(canvas.width - 75 - textLen - 20, detailsY + 82, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 7. Draw Barcode at the bottom center
  const barcodeWidth = 350;
  const barcodeHeight = 65;
  const barcodeX = canvas.width - 75 - barcodeWidth;
  const barcodeY = detailsY + 235;

  drawBarcode(ctx, barcodeX, barcodeY, barcodeWidth, barcodeHeight);
  
  // Barcode alphanumeric string
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.font = '12px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('HHG2026-XDF90184-SECURE', barcodeX + barcodeWidth / 2, barcodeY + barcodeHeight + 20);
  ctx.restore();
}
