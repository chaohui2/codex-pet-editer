export interface Animation {
  name: string;
  row: number;
  frames: number;
  loop: boolean;
  description: string;
}

export interface PetData {
  id: string;
  displayName: string;
  description: string;
  spritesheetPath: string;
  frameWidth: number;
  frameHeight: number;
  columns: number;
  rows: number;
  fps: number;
  animations: Animation[];
  tags?: string[];
  author?: string;
  version?: string;
}

export interface FrameOffset {
  x: number;
  y: number;
}

export interface EditorState {
  pet: PetData | null;
  spritesheet: HTMLImageElement | null;
  selectedAnimation: string | null;
  selectedFrame: number;
  isPlaying: boolean;
  zoom: number;
  pan: { x: number; y: number };
  frameOffsets: Map<string, FrameOffset>;
}

export const DEFAULT_PET: PetData = {
  id: 'juzi',
  displayName: 'Juzi',
  description: 'A tiny cream-and-ginger tabby kitten',
  spritesheetPath: 'spritesheet.webp',
  frameWidth: 192,
  frameHeight: 208,
  columns: 8,
  rows: 9,
  fps: 8,
  animations: [
    { name: 'idle', row: 0, frames: 6, loop: true, description: '待机 - 中性的呼吸与眨眼循环' },
    { name: 'running-right', row: 1, frames: 8, loop: true, description: '向右跑' },
    { name: 'running-left', row: 2, frames: 8, loop: true, description: '向左跑' },
    { name: 'waving', row: 3, frames: 4, loop: true, description: '挥手' },
    { name: 'jumping', row: 4, frames: 5, loop: true, description: '跳跃' },
    { name: 'failed', row: 5, frames: 8, loop: true, description: '失败/失落' },
    { name: 'waiting', row: 6, frames: 6, loop: true, description: '等待' },
    { name: 'running', row: 7, frames: 6, loop: true, description: '奔跑（向前）' },
    { name: 'review', row: 8, frames: 6, loop: true, description: '审视/观察' },
  ],
  tags: ['cat', 'kitten', 'cute', 'orange'],
  author: 'unknown',
  version: '1.0.0',
};
