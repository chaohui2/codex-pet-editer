import { PetData, FrameOffset, AlignmentStrategy } from '../types/pet';

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

export function getFrameKey(animationName: string, frameIndex: number): string {
  return `${animationName}_${frameIndex}`;
}

export function parseFrameKey(key: string): { animationName: string; frameIndex: number } | null {
  const parts = key.split('_');
  if (parts.length < 2) return null;
  const frameIndex = parseInt(parts[parts.length - 1], 10);
  const animationName = parts.slice(0, -1).join('_');
  return isNaN(frameIndex) ? null : { animationName, frameIndex };
}

export function getDefaultFrameOffset(): FrameOffset {
  return { x: 0, y: 0, scale: 1 };
}

export function calculateOffsetByStrategy(
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  frameWidth: number,
  frameHeight: number,
  strategy: AlignmentStrategy
): { x: number; y: number } {
  const contentWidth = bounds.maxX - bounds.minX + 1;
  const contentHeight = bounds.maxY - bounds.minY + 1;

  switch (strategy) {
    case 'center': {
      const contentCenterX = bounds.minX + contentWidth / 2;
      const contentCenterY = bounds.minY + contentHeight / 2;
      const frameCenterX = frameWidth / 2;
      const frameCenterY = frameHeight / 2;
      return {
        x: frameCenterX - contentCenterX,
        y: frameCenterY - contentCenterY,
      };
    }
    case 'bottom': {
      const contentCenterX = bounds.minX + contentWidth / 2;
      const contentBottom = bounds.maxY;
      const frameCenterX = frameWidth / 2;
      const frameBottom = frameHeight - 1;
      return {
        x: frameCenterX - contentCenterX,
        y: frameBottom - contentBottom,
      };
    }
    case 'top': {
      const contentCenterX = bounds.minX + contentWidth / 2;
      const contentTop = bounds.minY;
      const frameCenterX = frameWidth / 2;
      const frameTop = 0;
      return {
        x: frameCenterX - contentCenterX,
        y: frameTop - contentTop,
      };
    }
  }
}

export function calculateAllFrameOffsets(
  spritesheet: HTMLImageElement,
  pet: PetData,
  animationName: string,
  strategy: AlignmentStrategy
): Map<string, FrameOffset> {
  const result = new Map<string, FrameOffset>();

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return result;

  canvas.width = spritesheet.width;
  canvas.height = spritesheet.height;
  ctx.drawImage(spritesheet, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const animation = pet.animations.find((a) => a.name === animationName);
  if (!animation) return result;

  for (let frame = 0; frame < animation.frames; frame++) {
    const pos = getFramePosition(animation.row, frame, pet.frameWidth, pet.frameHeight);
    const bounds = getFramePixelBounds(imageData, pet.frameWidth, pet.frameHeight, pos.x, pos.y);
    const offset = calculateOffsetByStrategy(bounds, pet.frameWidth, pet.frameHeight, strategy);

    if (offset.x !== 0 || offset.y !== 0) {
      result.set(getFrameKey(animationName, frame), {
        x: Math.round(offset.x),
        y: Math.round(offset.y),
        scale: 1,
      });
    }
  }

  return result;
}

export function calculateAllAnimationsOffsets(
  spritesheet: HTMLImageElement,
  pet: PetData,
  strategy: AlignmentStrategy
): Map<string, FrameOffset> {
  const result = new Map<string, FrameOffset>();

  for (const animation of pet.animations) {
    const offsets = calculateAllFrameOffsets(spritesheet, pet, animation.name, strategy);
    offsets.forEach((value, key) => result.set(key, value));
  }

  return result;
}
