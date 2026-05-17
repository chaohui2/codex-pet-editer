import { create } from 'zustand';
import { PetData, FrameOffset, EditorState, NewPetConfig, createBlankPet } from '../types/pet';
import {
  replaceFrameInSpritesheet,
  addFrameToAnimation,
  deleteFrameFromAnimation,
  canvasToImage,
  createBlankSpritesheet,
} from '../utils/frameOperations';

// 从 localStorage 读取洋葱皮设置
const getStoredOnionSkinSettings = () => {
  try {
    const stored = localStorage.getItem('codex-pet-editor-onion-skin');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // 忽略错误
  }
  return {
    enabled: true,
    prevFrames: 1,
    nextFrames: 0,
  };
};

// 从 localStorage 读取面板宽度
const getStoredPanelWidth = () => {
  try {
    const stored = localStorage.getItem('codex-pet-editor-panel-width');
    if (stored) {
      return Number(stored);
    }
  } catch (e) {
    // 忽略错误
  }
  return 240;
};

const storedSettings = getStoredOnionSkinSettings();
const storedPanelWidth = getStoredPanelWidth();

interface EditorStore extends EditorState {
  setPet: (pet: PetData | null) => void;
  setSpritesheet: (img: HTMLImageElement | null) => void;
  setSpritesheetFromCanvas: (canvas: HTMLCanvasElement) => Promise<void>;
  replaceSelectedFrame: (newImage: HTMLImageElement) => Promise<void>;
  addFrameToAnimation: (animationName: string, frameImage?: HTMLImageElement | null) => Promise<void>;
  deleteFrame: (animationName: string, frameIndex: number) => Promise<void>;
  setSelectedAnimation: (name: string | null) => void;
  setSelectedFrame: (frame: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  setFrameOffset: (frameKey: string, offset: FrameOffset) => void;
  resetFrameOffset: (frameKey: string) => void;
  resetAllFrameOffsets: () => void;
  setFrameOffsetsFromMap: (offsets: Map<string, FrameOffset>) => void;
  setOnionSkinEnabled: (enabled: boolean) => void;
  setOnionSkinPrevFrames: (count: number) => void;
  setOnionSkinNextFrames: (count: number) => void;
  setPanelWidth: (width: number) => void;
  resetEditor: () => void;
  createNewPet: (config: NewPetConfig) => Promise<void>;
}

// 保存洋葱皮设置到 localStorage
const saveOnionSkinSettings = (state: Partial<EditorState>) => {
  try {
    const current = getStoredOnionSkinSettings();
    localStorage.setItem(
      'codex-pet-editor-onion-skin',
      JSON.stringify({
        enabled: state.onionSkinEnabled ?? current.enabled,
        prevFrames: state.onionSkinPrevFrames ?? current.prevFrames,
        nextFrames: state.onionSkinNextFrames ?? current.nextFrames,
      })
    );
  } catch (e) {
    // 忽略错误
  }
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  pet: null,
  spritesheet: null,
  selectedAnimation: null,
  selectedFrame: 0,
  isPlaying: false,
  zoom: 1,
  pan: { x: 0, y: 0 },
  frameOffsets: new Map(),
  alignmentStrategy: 'center',
  onionSkinEnabled: storedSettings.enabled,
  onionSkinPrevFrames: storedSettings.prevFrames,
  onionSkinNextFrames: storedSettings.nextFrames,
  panelWidth: storedPanelWidth,

  setPet: (pet) => set({ pet }),
  setSpritesheet: (spritesheet) => set({ spritesheet }),
  setSelectedAnimation: (selectedAnimation) => set({ selectedAnimation, selectedFrame: 0 }),
  setSelectedFrame: (selectedFrame) => set({ selectedFrame }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setZoom: (zoom) => set({ zoom }),
  setPan: (pan) => set({ pan }),
  setFrameOffset: (frameKey, offset) =>
    set((state) => {
      const newOffsets = new Map(state.frameOffsets);
      newOffsets.set(frameKey, offset);
      return { frameOffsets: newOffsets };
    }),
  resetFrameOffset: (frameKey) =>
    set((state) => {
      const newOffsets = new Map(state.frameOffsets);
      newOffsets.delete(frameKey);
      return { frameOffsets: newOffsets };
    }),
  resetAllFrameOffsets: () => set({ frameOffsets: new Map() }),
  setFrameOffsetsFromMap: (offsets) => set({ frameOffsets: new Map(offsets) }),
  setOnionSkinEnabled: (onionSkinEnabled) => {
    set({ onionSkinEnabled });
    saveOnionSkinSettings({ onionSkinEnabled });
  },
  setOnionSkinPrevFrames: (onionSkinPrevFrames) => {
    set({ onionSkinPrevFrames });
    saveOnionSkinSettings({ onionSkinPrevFrames });
  },
  setOnionSkinNextFrames: (onionSkinNextFrames) => {
    set({ onionSkinNextFrames });
    saveOnionSkinSettings({ onionSkinNextFrames });
  },
  setPanelWidth: (panelWidth) => {
    set({ panelWidth });
    try {
      localStorage.setItem('codex-pet-editor-panel-width', String(panelWidth));
    } catch (e) {
      // 忽略错误
    }
  },

  setSpritesheetFromCanvas: async (canvas: HTMLCanvasElement) => {
    const newImage = await canvasToImage(canvas);
    set({ spritesheet: newImage });
  },

  replaceSelectedFrame: async (newImage: HTMLImageElement) => {
    const state = get();
    if (!state.spritesheet || !state.pet || !state.selectedAnimation) {
      throw new Error('缺少必要的状态：精灵图、宠物数据或选中的动画');
    }

    const canvas = replaceFrameInSpritesheet(
      state.spritesheet,
      state.pet,
      state.selectedAnimation,
      state.selectedFrame,
      newImage
    );

    const updatedImage = await canvasToImage(canvas);
    set({ spritesheet: updatedImage });
  },

  addFrameToAnimation: async (animationName: string, frameImage: HTMLImageElement | null = null) => {
    const state = get();
    if (!state.spritesheet || !state.pet) {
      throw new Error('缺少必要的状态：精灵图或宠物数据');
    }

    const result = addFrameToAnimation(
      state.spritesheet,
      state.pet,
      animationName,
      frameImage
    );

    const updatedImage = await canvasToImage(result.canvas);
    set({
      spritesheet: updatedImage,
      pet: result.pet,
    });

    if (state.selectedAnimation === animationName) {
      const animation = result.pet.animations.find((a) => a.name === animationName);
      if (animation) {
        set({ selectedFrame: animation.frames - 1 });
      }
    }
  },

  deleteFrame: async (animationName: string, frameIndex: number) => {
    const state = get();
    if (!state.spritesheet || !state.pet) {
      throw new Error('缺少必要的状态：精灵图或宠物数据');
    }

    const result = deleteFrameFromAnimation(
      state.spritesheet,
      state.pet,
      animationName,
      frameIndex
    );

    const updatedImage = await canvasToImage(result.canvas);

    // 如果删除的是当前选中的帧，需要更新选中帧
    let newSelectedFrame = state.selectedFrame;
    if (state.selectedAnimation === animationName) {
      const animation = result.pet.animations.find((a) => a.name === animationName);
      if (animation) {
        // 如果删除的是最后一帧，选中前一帧
        if (frameIndex >= animation.frames) {
          newSelectedFrame = Math.max(0, animation.frames - 1);
        } else if (frameIndex <= state.selectedFrame) {
          // 如果删除的帧在当前选中帧之前或就是当前帧，选中帧减1
          newSelectedFrame = Math.max(0, state.selectedFrame - 1);
        }
      }
    }

    set({
      spritesheet: updatedImage,
      pet: result.pet,
      selectedFrame: newSelectedFrame,
    });
  },

  resetEditor: () =>
    set({
      pet: null,
      spritesheet: null,
      selectedAnimation: null,
      selectedFrame: 0,
      isPlaying: false,
      zoom: 1,
      pan: { x: 0, y: 0 },
      frameOffsets: new Map(),
      alignmentStrategy: 'center',
      onionSkinEnabled: true,
      onionSkinPrevFrames: 1,
      onionSkinNextFrames: 0,
    }),

  createNewPet: async (config: NewPetConfig) => {
    const pet = createBlankPet(config);
    const canvas = createBlankSpritesheet(
      pet.frameWidth,
      pet.frameHeight,
      pet.columns,
      pet.rows
    );
    const spritesheet = await canvasToImage(canvas);

    set({
      pet,
      spritesheet,
      selectedAnimation: pet.animations[0]?.name || null,
      selectedFrame: 0,
      isPlaying: false,
      zoom: 1,
      pan: { x: 0, y: 0 },
      frameOffsets: new Map(),
      alignmentStrategy: 'center',
    });
  },
}));
