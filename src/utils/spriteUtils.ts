import { PetData } from '../types/pet';

export function getFramePosition(
  row: number,
  frame: number,
  frameWidth: number,
  frameHeight: number
): { x: number; y: number } {
  return {
    x: frame * frameWidth,
    y: row * frameHeight,
  };
}

export function getGlobalFrameIndex(
  row: number,
  frame: number,
  columns: number
): number {
  return row * columns + frame;
}

export function getFrameFromGlobalIndex(
  globalIndex: number,
  columns: number
): { row: number; frame: number } {
  return {
    row: Math.floor(globalIndex / columns),
    frame: globalIndex % columns,
  };
}

export function getAnimationFrames(
  pet: PetData,
  animationName: string
): { startFrame: number; endFrame: number; row: number } | null {
  const animation = pet.animations.find((a) => a.name === animationName);
  if (!animation) return null;

  return {
    row: animation.row,
    startFrame: 0,
    endFrame: animation.frames - 1,
  };
}

export function getFramePixelBounds(
  imageData: ImageData,
  frameWidth: number,
  frameHeight: number,
  startX: number,
  startY: number
): { minX: number; maxX: number; minY: number; maxY: number } {
  const data = imageData.data;
  let minX = frameWidth;
  let maxX = 0;
  let minY = frameHeight;
  let maxY = 0;
  let hasPixel = false;

  for (let y = 0; y < frameHeight; y++) {
    for (let x = 0; x < frameWidth; x++) {
      const pixelX = startX + x;
      const pixelY = startY + y;
      const idx = (pixelY * imageData.width + pixelX) * 4;
      const alpha = data[idx + 3];

      if (alpha > 10) {
        hasPixel = true;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (!hasPixel) {
    return { minX: 0, maxX: frameWidth - 1, minY: 0, maxY: frameHeight - 1 };
  }

  return { minX, maxX, minY, maxY };
}

export function calculateCenterOffset(
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  frameWidth: number,
  frameHeight: number
): { x: number; y: number } {
  const contentWidth = bounds.maxX - bounds.minX + 1;
  const contentHeight = bounds.maxY - bounds.minY + 1;
  const contentCenterX = bounds.minX + contentWidth / 2;
  const contentCenterY = bounds.minY + contentHeight / 2;
  const frameCenterX = frameWidth / 2;
  const frameCenterY = frameHeight / 2;

  return {
    x: frameCenterX - contentCenterX,
    y: frameCenterY - contentCenterY,
  };
}
