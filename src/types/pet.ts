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
  frameOffsets?: Record<string, FrameOffset>;
  tags?: string[];
  author?: string;
  version?: string;
}

export interface FrameOffset {
  x: number;
  y: number;
  scale: number;
}

export type AlignmentStrategy = 'center' | 'bottom' | 'top';

export interface EditorState {
  pet: PetData | null;
  spritesheet: HTMLImageElement | null;
  selectedAnimation: string | null;
  selectedFrame: number;
  isPlaying: boolean;
  zoom: number;
  pan: { x: number; y: number };
  frameOffsets: Map<string, FrameOffset>;
  alignmentStrategy: AlignmentStrategy;
  onionSkinEnabled: boolean;
  onionSkinPrevFrames: number;
  onionSkinNextFrames: number;
  panelWidth: number;
}

export interface NewPetAnimationConfig {
  name: string;
  frames: number;
  loop: boolean;
  description: string;
}

export interface NewPetConfig {
  frameWidth: number;
  frameHeight: number;
  columns: number;
  animations: NewPetAnimationConfig[];
}

export const DEFAULT_PET: PetData = {
  id: 'new-pet',
  displayName: 'New Pet',
  description: 'A cute desktop pet for Codex.',
  spritesheetPath: 'spritesheet.webp',
  frameWidth: 192,
  frameHeight: 208,
  columns: 8,
  rows: 9,
  fps: 8,
  animations: [
    { name: '待机', row: 0, frames: 6, loop: true, description: '待机' },
    { name: '右跑', row: 1, frames: 8, loop: true, description: '向右奔跑' },
    { name: '左跑', row: 2, frames: 8, loop: true, description: '向左奔跑' },
    { name: '挥手', row: 3, frames: 4, loop: true, description: '挥手打招呼' },
    { name: '跳跃', row: 4, frames: 5, loop: true, description: '跳跃动作' },
    { name: '失败', row: 5, frames: 8, loop: true, description: '失败/失落状态' },
    { name: '等待', row: 6, frames: 6, loop: true, description: '等待状态' },
    { name: '奔跑', row: 7, frames: 6, loop: true, description: '向前奔跑' },
    { name: '观察', row: 8, frames: 6, loop: true, description: '审视/观察状态' },
  ],
  tags: ['pet', 'cute'],
  author: 'unknown',
  version: '1.0.0',
};

export function createBlankPet(config: NewPetConfig): PetData {
  const rows = config.animations.length;
  const maxFramesPerRow = Math.max(...config.animations.map(a => a.frames));
  const actualColumns = Math.max(config.columns, maxFramesPerRow);

  return {
    ...DEFAULT_PET,
    frameWidth: config.frameWidth,
    frameHeight: config.frameHeight,
    columns: actualColumns,
    rows,
    animations: config.animations.map((anim, index) => ({
      ...anim,
      row: index,
    })),
    frameOffsets: undefined,
  };
}
