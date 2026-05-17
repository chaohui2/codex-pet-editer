import { useCallback, useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { loadPetFromFiles, loadImage, frameOffsetsFromRecord } from '../utils/petParser';
import { DEFAULT_PET } from '../types/pet';

interface FileUploadState {
  isDragging: boolean;
  error: string | null;
}

export function useFileHandler() {
  const { setPet, setSpritesheet, setFrameOffsetsFromMap, resetEditor } = useEditorStore();

  const [state, setState] = useState<FileUploadState>({
    isDragging: false,
    error: null,
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState((s) => ({ ...s, isDragging: true }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState((s) => ({ ...s, isDragging: false }));
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setState((s) => ({ ...s, isDragging: false, error: null }));

      const files = Array.from(e.dataTransfer.files);

      const jsonFile = files.find((f) => f.name.endsWith('.json'));
      const imageFile = files.find((f) =>
        /\.(webp|png|jpg|jpeg)$/i.test(f.name)
      );

      if (!jsonFile && !imageFile) {
        setState((s) => ({ ...s, error: '请上传 pet.json 或 精灵图图片文件' }));
        return;
      }

      try {
        if (jsonFile && imageFile) {
          const { pet, image } = await loadPetFromFiles(jsonFile, imageFile);
          setPet(pet);
          setSpritesheet(image);
          if (pet.frameOffsets) {
            setFrameOffsetsFromMap(frameOffsetsFromRecord(pet.frameOffsets));
          }
        } else if (jsonFile) {
          const jsonText = await jsonFile.text();
          const petData = JSON.parse(jsonText);
          const pet = { ...DEFAULT_PET, ...petData };
          setPet(pet);
          if (pet.frameOffsets) {
            setFrameOffsetsFromMap(frameOffsetsFromRecord(pet.frameOffsets));
          }
        } else if (imageFile) {
          const imageUrl = URL.createObjectURL(imageFile);
          const image = await loadImage(imageUrl);
          setSpritesheet(image);
          setPet(DEFAULT_PET);
        }
      } catch (error) {
        console.error('Failed to load files:', error);
        setState((s) => ({ ...s, error: '加载文件失败' }));
      }
    },
    [setPet, setSpritesheet]
  );

  const loadSamplePet = useCallback(async () => {
    try {
      const response = await fetch('/pets/juzi/pet.json');
      const petData = await response.json();
      const pet = { ...DEFAULT_PET, ...petData };
      setPet(pet);

      if (pet.frameOffsets) {
        setFrameOffsetsFromMap(frameOffsetsFromRecord(pet.frameOffsets));
      }

      const image = await loadImage('/pets/juzi/spritesheet.webp');
      setSpritesheet(image);
      setState((s) => ({ ...s, error: null }));
    } catch (error) {
      console.error('Failed to load sample pet:', error);
      setState((s) => ({ ...s, error: '加载示例宠物失败，请确保服务器已启动' }));
    }
  }, [setPet, setSpritesheet, setFrameOffsetsFromMap]);

  return {
    ...state,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    loadSamplePet,
    resetEditor,
  };
}
