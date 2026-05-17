import { create } from 'zustand';
import { PetData, FrameOffset, EditorState } from '../types/pet';

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
    enabled: false,
    prevFrames: 2,
    nextFrames: 2,
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
  setSelectedAnimation: (name: string | null) => void;
  setSelectedFrame: (frame: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  setFrameOffset: (frameKey: string, offset: FrameOffset) => void;
  setOnionSkinEnabled: (enabled: boolean) => void;
  setOnionSkinPrevFrames: (count: number) => void;
  setOnionSkinNextFrames: (count: number) => void;
  setPanelWidth: (width: number) => void;
  resetEditor: () => void;
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

export const useEditorStore = create<EditorStore>((set) => ({
  pet: null,
  spritesheet: null,
  selectedAnimation: null,
  selectedFrame: 0,
  isPlaying: false,
  zoom: 1,
  pan: { x: 0, y: 0 },
  frameOffsets: new Map(),
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
      onionSkinEnabled: false,
      onionSkinPrevFrames: 2,
      onionSkinNextFrames: 2,
    }),
}));
