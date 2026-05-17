import { PetData } from '../types/pet';
import { getFramePosition } from './spriteUtils';

/**
 * 将图片缩放到适配帧尺寸（保持宽高比）
 */
export function drawImageToFitFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  frameWidth: number,
  frameHeight: number,
  destX: number,
  destY: number
) {
  const imgRatio = img.width / img.height;
  const frameRatio = frameWidth / frameHeight;

  let drawWidth: number;
  let drawHeight: number;
  let offsetX: number;
  let offsetY: number;

  if (imgRatio > frameRatio) {
    drawWidth = frameWidth;
    drawHeight = frameWidth / imgRatio;
    offsetX = 0;
    offsetY = (frameHeight - drawHeight) / 2;
  } else {
    drawHeight = frameHeight;
    drawWidth = frameHeight * imgRatio;
    offsetX = (frameWidth - drawWidth) / 2;
    offsetY = 0;
  }

  ctx.drawImage(img, destX + offsetX, destY + offsetY, drawWidth, drawHeight);
}

/**
 * 替换精灵图中指定位置的帧
 * @param spritesheet 原始精灵图
 * @param pet 宠物数据
 * @param animationName 动画名称
 * @param frameIndex 帧索引
 * @param newImage 新的图片
 * @returns 修改后的 Canvas
 */
export function replaceFrameInSpritesheet(
  spritesheet: HTMLImageElement,
  pet: PetData,
  animationName: string,
  frameIndex: number,
  newImage: HTMLImageElement
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建 Canvas 上下文');

  canvas.width = spritesheet.width;
  canvas.height = spritesheet.height;

  ctx.drawImage(spritesheet, 0, 0);

  const animation = pet.animations.find((a) => a.name === animationName);
  if (!animation) throw new Error(`未找到动画: ${animationName}`);

  const pos = getFramePosition(animation.row, frameIndex, pet.frameWidth, pet.frameHeight);

  drawImageToFitFrame(ctx, newImage, pet.frameWidth, pet.frameHeight, pos.x, pos.y);

  return canvas;
}

/**
 * 创建扩展后的精灵图（添加新列）
 * @param spritesheet 原始精灵图
 * @param pet 宠物数据
 * @param newColumns 新增列数
 * @returns 扩展后的 Canvas
 */
export function createExtendedSpritesheet(
  spritesheet: HTMLImageElement,
  pet: PetData,
  newColumns: number = 1
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建 Canvas 上下文');

  const newWidth = spritesheet.width + newColumns * pet.frameWidth;
  canvas.width = newWidth;
  canvas.height = spritesheet.height;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(spritesheet, 0, 0);

  return canvas;
}

/**
 * 在指定动画的末尾添加新帧
 * @param spritesheet 原始精灵图
 * @param pet 宠物数据
 * @param animationName 动画名称
 * @param frameImage 新帧的图片（可选，为 null 则留空）
 * @returns 包含新精灵图 Canvas 和更新后的宠物数据的对象
 */
export function addFrameToAnimation(
  spritesheet: HTMLImageElement,
  pet: PetData,
  animationName: string,
  frameImage: HTMLImageElement | null
): { canvas: HTMLCanvasElement; pet: PetData } {
  const animation = pet.animations.find((a) => a.name === animationName);
  if (!animation) throw new Error(`未找到动画: ${animationName}`);

  const newFrameIndex = animation.frames;
  let canvas: HTMLCanvasElement;

  if (newFrameIndex >= pet.columns) {
    canvas = createExtendedSpritesheet(spritesheet, pet, 1);
  } else {
    canvas = document.createElement('canvas');
    canvas.width = spritesheet.width;
    canvas.height = spritesheet.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法创建 Canvas 上下文');
    ctx.drawImage(spritesheet, 0, 0);
  }

  if (frameImage) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const pos = getFramePosition(animation.row, newFrameIndex, pet.frameWidth, pet.frameHeight);
      drawImageToFitFrame(ctx, frameImage, pet.frameWidth, pet.frameHeight, pos.x, pos.y);
    }
  }

  const updatedPet: PetData = {
    ...pet,
    columns: newFrameIndex >= pet.columns ? pet.columns + 1 : pet.columns,
    animations: pet.animations.map((a) =>
      a.name === animationName ? { ...a, frames: a.frames + 1 } : a
    ),
  };

  return { canvas, pet: updatedPet };
}

/**
 * 删除动画中指定的帧
 * @param spritesheet 原始精灵图
 * @param pet 宠物数据
 * @param animationName 动画名称
 * @param frameIndex 要删除的帧索引
 * @returns 包含新精灵图 Canvas 和更新后的宠物数据的对象
 */
export function deleteFrameFromAnimation(
  spritesheet: HTMLImageElement,
  pet: PetData,
  animationName: string,
  frameIndex: number
): { canvas: HTMLCanvasElement; pet: PetData } {
  const animation = pet.animations.find((a) => a.name === animationName);
  if (!animation) throw new Error(`未找到动画: ${animationName}`);

  if (animation.frames <= 1) {
    throw new Error('动画至少需要保留1帧');
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建 Canvas 上下文');

  canvas.width = spritesheet.width;
  canvas.height = spritesheet.height;

  ctx.drawImage(spritesheet, 0, 0);

  // 将被删除帧后面的所有帧向前移动
  for (let i = frameIndex; i < animation.frames - 1; i++) {
    const srcPos = getFramePosition(animation.row, i + 1, pet.frameWidth, pet.frameHeight);
    const destPos = getFramePosition(animation.row, i, pet.frameWidth, pet.frameHeight);

    ctx.clearRect(destPos.x, destPos.y, pet.frameWidth, pet.frameHeight);
    ctx.drawImage(
      spritesheet,
      srcPos.x,
      srcPos.y,
      pet.frameWidth,
      pet.frameHeight,
      destPos.x,
      destPos.y,
      pet.frameWidth,
      pet.frameHeight
    );
  }

  // 清空最后一帧
  const lastPos = getFramePosition(animation.row, animation.frames - 1, pet.frameWidth, pet.frameHeight);
  ctx.clearRect(lastPos.x, lastPos.y, pet.frameWidth, pet.frameHeight);

  const updatedPet: PetData = {
    ...pet,
    animations: pet.animations.map((a) =>
      a.name === animationName ? { ...a, frames: a.frames - 1 } : a
    ),
  };

  return { canvas, pet: updatedPet };
}

/**
 * 从 Canvas 创建 HTMLImageElement
 */
export function canvasToImage(canvas: HTMLCanvasElement): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = canvas.toDataURL('image/png');
  });
}
