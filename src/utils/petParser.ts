import { PetData, DEFAULT_PET } from '../types/pet';

export function parsePetJson(json: string): PetData {
  const data = JSON.parse(json);

  return {
    ...DEFAULT_PET,
    ...data,
    animations: data.animations || DEFAULT_PET.animations,
  };
}

export function serializePetJson(pet: PetData): string {
  return JSON.stringify(pet, null, 2);
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
  URL.revokeObjectURL(imageUrl);

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
