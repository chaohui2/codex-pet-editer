import { PetData, FrameOffset, DEFAULT_PET } from '../types/pet';
import { getFramePosition, getFrameKey, getDefaultFrameOffset } from './spriteUtils';
import JSZip from 'jszip';

export function parsePetJson(json: string): PetData {
  const data = JSON.parse(json);

  return {
    ...DEFAULT_PET,
    ...data,
    animations: data.animations || DEFAULT_PET.animations,
    frameOffsets: data.frameOffsets,
  };
}

export function serializePetJson(
  pet: PetData,
  frameOffsets?: Map<string, FrameOffset>
): string {
  const petData: PetData & { frameOffsets?: Record<string, FrameOffset> } = { ...pet };

  if (frameOffsets && frameOffsets.size > 0) {
    const offsetsRecord: Record<string, FrameOffset> = {};
    frameOffsets.forEach((value, key) => {
      offsetsRecord[key] = value;
    });
    petData.frameOffsets = offsetsRecord;
  }

  return JSON.stringify(petData, null, 2);
}

export function frameOffsetsFromRecord(
  record?: Record<string, FrameOffset>
): Map<string, FrameOffset> {
  const result = new Map<string, FrameOffset>();
  if (record) {
    Object.entries(record).forEach(([key, value]) => {
      result.set(key, value);
    });
  }
  return result;
}

export function validatePetData(data: unknown): data is PetData {
  if (typeof data !== 'object' || data === null) return false;

  const pet = data as Record<string, unknown>;

  if (typeof pet.id !== 'string') return false;
  if (typeof pet.displayName !== 'string') return false;
  if (typeof pet.description !== 'string') return false;
  if (typeof pet.spritesheetPath !== 'string') return false;

  return true;
}

export async function loadPetFromFiles(
  jsonFile: File,
  imageFile: File
): Promise<{ pet: PetData; image: HTMLImageElement }> {
  const jsonText = await jsonFile.text();
  const pet = parsePetJson(jsonText);

  const imageUrl = URL.createObjectURL(imageFile);
  const image = await loadImage(imageUrl);

  return { pet, image };
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCanvasAsImage(
  canvas: HTMLCanvasElement,
  filename: string,
  format: 'png' | 'webp' = 'webp',
  quality: number = 0.9
) {
  const mimeType = format === 'webp' ? 'image/webp' : 'image/png';
  const dataUrl = canvas.toDataURL(mimeType, quality);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * 导出宠物为 zip 文件
 * @param petJson 宠物 JSON 字符串
 * @param canvas 精灵图 Canvas
 * @param folderId 文件夹名称（使用宠物 ID）
 * @param imageQuality 图片质量 (0-1)
 */
export async function downloadPetAsZip(
  petJson: string,
  canvas: HTMLCanvasElement,
  folderId: string,
  imageQuality: number = 0.95
) {
  const zip = new JSZip();
  const folder = zip.folder(folderId);
  if (!folder) throw new Error('无法创建 zip 文件夹');

  // 添加 pet.json
  folder.file('pet.json', petJson);

  // 添加 spritesheet.webp
  const webpBlob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else throw new Error('无法创建 webp blob');
    }, 'image/webp', imageQuality);
  });
  folder.file('spritesheet.webp', webpBlob);

  // 生成并下载 zip
  const zipContent = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipContent);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${folderId}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function createAlignedSpritesheet(
  spritesheet: HTMLImageElement,
  pet: PetData,
  frameOffsets: Map<string, FrameOffset>
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建 Canvas 上下文');

  canvas.width = spritesheet.width;
  canvas.height = spritesheet.height;

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 按偏移绘制每帧
  for (const animation of pet.animations) {
    for (let frame = 0; frame < animation.frames; frame++) {
      const key = getFrameKey(animation.name, frame);
      const offset = frameOffsets.get(key) || getDefaultFrameOffset();
      const srcPos = getFramePosition(animation.row, frame, pet.frameWidth, pet.frameHeight);

      const scale = offset.scale || 1;
      const destWidth = pet.frameWidth * scale;
      const destHeight = pet.frameHeight * scale;
      const offsetX = (pet.frameWidth - destWidth) / 2 + offset.x;
      const offsetY = (pet.frameHeight - destHeight) / 2 + offset.y;

      ctx.drawImage(
        spritesheet,
        srcPos.x,
        srcPos.y,
        pet.frameWidth,
        pet.frameHeight,
        srcPos.x + offsetX,
        srcPos.y + offsetY,
        destWidth,
        destHeight
      );
    }
  }

  return canvas;
}
