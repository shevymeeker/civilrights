#!/usr/bin/env node

/**
 * Simple icon generator for PWA
 * This creates basic placeholder icons. For production, use a proper icon generator service.
 */

import fs from 'fs';
import { createCanvas } from 'canvas';

const sizes = [192, 512];
const colors = {
  bg: '#0f172a',
  primary: '#3b82f6',
  text: '#60a5fa'
};

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, size, size);

  // Shield
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = size / 40;
  ctx.beginPath();
  const centerX = size / 2;
  const centerY = size / 2;
  const shieldSize = size / 3;
  ctx.moveTo(centerX - shieldSize, centerY - shieldSize);
  ctx.lineTo(centerX, centerY - shieldSize * 1.3);
  ctx.lineTo(centerX + shieldSize, centerY - shieldSize);
  ctx.lineTo(centerX + shieldSize, centerY + shieldSize / 2);
  ctx.quadraticCurveTo(centerX + shieldSize, centerY + shieldSize, centerX, centerY + shieldSize * 1.2);
  ctx.quadraticCurveTo(centerX - shieldSize, centerY + shieldSize, centerX - shieldSize, centerY + shieldSize / 2);
  ctx.closePath();
  ctx.stroke();

  // Text
  ctx.fillStyle = colors.text;
  ctx.font = `bold ${size / 8}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('KTS', centerX, centerY + shieldSize * 1.7);

  return canvas.toBuffer('image/png');
}

// Generate icons
sizes.forEach(size => {
  try {
    const buffer = generateIcon(size);
    fs.writeFileSync(`./public/pwa-${size}x${size}.png`, buffer);
    console.log(`✓ Generated pwa-${size}x${size}.png`);
  } catch (error) {
    console.error(`✗ Failed to generate ${size}x${size}:`, error.message);
    console.log(`  Install canvas: npm install canvas`);
  }
});

console.log('\nIcon generation complete!');
