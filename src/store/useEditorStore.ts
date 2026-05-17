import { create } from 'zustand';
import { PetData, FrameOffset, EditorState } from '../types/pet';

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
  resetEditor: () => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
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
  setOnionSkinEnabled: (onionSkinEnabled) => set({ onionSkinEnabled }),
  setOnionSkinPrevFrames: (onionSkinPrevFrames) => set({ onionSkinPrevFrames }),
  setOnionSkinNextFrames: (onionSkinNextFrames) => set({ onionSkinNextFrames }),
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
