/* ═══════════════════════════════════════════════════════════════
   ZYVORA® – Embryo Texture Generator
   Procedural embryonic texture for the 3D egg visualization
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/**
 * Generate a base64 encoded PNG texture for the embryo visualization.
 * This creates a procedural texture with blood vessel-like patterns,
 * warm yolk tones, and cellular structures.
 */
const EMBRYO_TEXTURE_BASE64 = (function generateEmbryoTexture() {
  const SIZE = 256;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  // Base warm yolk gradient
  const grad = ctx.createRadialGradient(SIZE/2, SIZE/2, 0, SIZE/2, SIZE/2, SIZE/2);
  grad.addColorStop(0, 'rgba(255, 200, 120, 0.9)');
  grad.addColorStop(0.3, 'rgba(245, 180, 100, 0.7)');
  grad.addColorStop(0.6, 'rgba(220, 150, 80, 0.5)');
  grad.addColorStop(1, 'rgba(180, 120, 60, 0.3)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Embryo center glow
  const embryoGrad = ctx.createRadialGradient(SIZE*0.48, SIZE*0.45, 0, SIZE*0.48, SIZE*0.45, SIZE*0.2);
  embryoGrad.addColorStop(0, 'rgba(255, 230, 180, 0.8)');
  embryoGrad.addColorStop(0.5, 'rgba(255, 200, 150, 0.4)');
  embryoGrad.addColorStop(1, 'rgba(255, 180, 120, 0.0)');
  ctx.fillStyle = embryoGrad;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Blood vessel network (procedural branching lines)
  function drawVessel(startX, startY, angle, length, width, depth) {
    if (depth <= 0 || length < 3) return;
    
    ctx.beginPath();
    ctx.strokeStyle = `rgba(180, 50, 30, ${0.15 + depth * 0.05})`;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    
    const endX = startX + Math.cos(angle) * length;
    const endY = startY + Math.sin(angle) * length;
    
    // Slight curve
    const cpX = (startX + endX) / 2 + (Math.random() - 0.5) * length * 0.3;
    const cpY = (startY + endY) / 2 + (Math.random() - 0.5) * length * 0.3;
    
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    ctx.stroke();
    
    // Branch
    const branchProb = depth > 2 ? 0.7 : 0.4;
    if (Math.random() < branchProb) {
      drawVessel(endX, endY, angle + (Math.random() * 0.8 - 0.2), length * 0.7, width * 0.7, depth - 1);
      drawVessel(endX, endY, angle - (Math.random() * 0.8 - 0.2), length * 0.65, width * 0.65, depth - 1);
    } else {
      drawVessel(endX, endY, angle + (Math.random() - 0.5) * 0.5, length * 0.75, width * 0.8, depth - 1);
    }
  }

  // Generate main vessel branches from center
  const cx = SIZE * 0.48;
  const cy = SIZE * 0.45;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
    drawVessel(cx, cy, angle, SIZE * 0.12, 2.5, 5);
  }

  // Cellular dots
  for (let i = 0; i < 40; i++) {
    const x = cx + (Math.random() - 0.5) * SIZE * 0.5;
    const y = cy + (Math.random() - 0.5) * SIZE * 0.5;
    const r = Math.random() * 3 + 1;
    const cellGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
    cellGrad.addColorStop(0, 'rgba(255, 220, 160, 0.5)');
    cellGrad.addColorStop(1, 'rgba(255, 200, 140, 0.0)');
    ctx.fillStyle = cellGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Noise grain overlay for organic feel
  const imgData = ctx.getImageData(0, 0, SIZE, SIZE);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 15;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise));
    data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  return canvas.toDataURL('image/png');
})();
