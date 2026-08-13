/**
 * HTML5 Canvas Rendering Pipeline for HH Goa 2026 Identity Studio
 */

import { FORMATS } from '../formats/formats';

/**
 * Simple pseudo-random generator seeded by string/number for deterministic barcode rendering
 */
function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

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
 * Draws a deterministic procedural barcode for the Builder ID Card.
 */
function drawBarcode(ctx, x, y, width, height, seedStr = 'HHG2026') {
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  
  let currentX = x;
  const endX = x + width;
  
  let seedNum = 12345;
  for (let i = 0; i < seedStr.length; i++) {
    seedNum += seedStr.charCodeAt(i) * (i + 1);
  }
  const rand = seededRandom(seedNum);

  while (currentX < endX) {
    const r1 = rand();
    const r2 = rand();
    const barWidth = r1 > 0.4 ? (r2 > 0.5 ? 4 : 2) : 1;
    const spaceWidth = r1 > 0.4 ? (r2 > 0.5 ? 3 : 1) : 2;
    
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

  // Bottom badge background
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
  canvas.width = FORMATS.BUILDER_CARD.width;
  canvas.height = FORMATS.BUILDER_CARD.height;
  const ctx = canvas.getContext('2d');

  const {
    name = 'BUILDER #404',
    role = 'HACKER',
    github = '',
    status = 'VERIFIED PASS'
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
  ctx.fillText(displayName, 65, detailsY + 88);

  // Label Role
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = 'bold 15px "Space Mono", monospace';
  ctx.fillText('STACK / ROLE //', 65, detailsY + 145);

  // Role value (auto-scale font size if long)
  ctx.fillStyle = '#A7FF37'; // Lime accent
  let roleFontSize = 24;
  ctx.font = `bold ${roleFontSize}px "Space Mono", monospace`;
  while (ctx.measureText(displayRole).width > 420 && roleFontSize > 14) {
    roleFontSize -= 1;
    ctx.font = `bold ${roleFontSize}px "Space Mono", monospace`;
  }
  ctx.fillText(displayRole, 65, detailsY + 182);

  // GitHub handle
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = 'bold 15px "Space Mono", monospace';
  ctx.fillText('GITHUB //', 65, detailsY + 235);
  ctx.fillStyle = '#00F2FE'; // Teal accent
  let ghFontSize = 20;
  ctx.font = `bold ${ghFontSize}px "Space Mono", monospace`;
  while (ctx.measureText(displayGithub).width > 420 && ghFontSize > 12) {
    ghFontSize -= 1;
    ctx.font = `bold ${ghFontSize}px "Space Mono", monospace`;
  }
  ctx.fillText(displayGithub, 65, detailsY + 268);

  // Meta details right side: Status & Barcode
  ctx.textAlign = 'right';

  // Status block
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = 'bold 15px "Space Mono", monospace';
  ctx.fillText('STATUS //', canvas.width - 65, detailsY + 45);

  // Verified Badge (Lime)
  ctx.fillStyle = '#A7FF37';
  ctx.font = '800 22px "Outfit", sans-serif';
  ctx.fillText(status, canvas.width - 65, detailsY + 82);
  
  // Status indicator circle
  ctx.fillStyle = '#A7FF37';
  ctx.beginPath();
  const textLen = ctx.measureText(status).width;
  ctx.arc(canvas.width - 65 - textLen - 16, detailsY + 75, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 7. Draw Barcode at bottom right
  const barcodeWidth = 320;
  const barcodeHeight = 60;
  const barcodeX = canvas.width - 65 - barcodeWidth;
  const barcodeY = detailsY + 220;

  drawBarcode(ctx, barcodeX, barcodeY, barcodeWidth, barcodeHeight, displayName);
  
  // Barcode alphanumeric string
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.font = '12px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`HHG2026-${displayName.replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'PASS'}-SECURE`, barcodeX + barcodeWidth / 2, barcodeY + barcodeHeight + 18);
  ctx.restore();
}
