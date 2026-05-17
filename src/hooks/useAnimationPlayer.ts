import { useEffect, useRef, useCallback } from 'react';
import { PetData } from '../types/pet';
import { useEditorStore } from '../store/useEditorStore';

export function useAnimationPlayer() {
  const { pet, selectedAnimation, isPlaying, selectedFrame, setSelectedFrame, setIsPlaying } =
    useEditorStore();

  const frameIntervalRef = useRef<number | null>(null);

  const getAnimationFrames = useCallback(() => {
    if (!pet || !selectedAnimation) return null;
    const animation = pet.animations.find((a) => a.name === selectedAnimation);
    if (!animation) return null;
    return {
      startFrame: 0,
      endFrame: animation.frames - 1,
      loop: animation.loop,
    };
  }, [pet, selectedAnimation]);

  const nextFrame = useCallback(() => {
    const frames = getAnimationFrames();
    if (!frames) return;

    if (selectedFrame >= frames.endFrame) {
      if (frames.loop) {
        setSelectedFrame(frames.startFrame);
      } else {
        setIsPlaying(false);
      }
    } else {
      setSelectedFrame(selectedFrame + 1);
    }
  }, [selectedFrame, getAnimationFrames, setSelectedFrame, setIsPlaying]);

  useEffect(() => {
    if (isPlaying && pet) {
      const fps = pet.fps || 8;
      const interval = 1000 / fps;

      frameIntervalRef.current = window.setInterval(nextFrame, interval);
    }

    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
    };
  }, [isPlaying, pet, nextFrame]);

  const play = useCallback(() => setIsPlaying(true), [setIsPlaying]);
  const pause = useCallback(() => setIsPlaying(false), [setIsPlaying]);
  const toggle = useCallback(() => setIsPlaying(!isPlaying), [isPlaying, setIsPlaying]);

  const stepForward = useCallback(() => {
    const frames = getAnimationFrames();
    if (!frames) return;
    if (selectedFrame < frames.endFrame) {
      setSelectedFrame(selectedFrame + 1);
    } else if (frames.loop) {
      setSelectedFrame(frames.startFrame);
    }
  }, [selectedFrame, getAnimationFrames, setSelectedFrame]);

  const stepBackward = useCallback(() => {
    const frames = getAnimationFrames();
    if (!frames) return;
    if (selectedFrame > frames.startFrame) {
      setSelectedFrame(selectedFrame - 1);
    } else if (frames.loop) {
      setSelectedFrame(frames.endFrame);
    }
  }, [selectedFrame, getAnimationFrames, setSelectedFrame]);

  return {
    play,
    pause,
    toggle,
    stepForward,
    stepBackward,
    isPlaying,
    currentFrame: selectedFrame,
  };
}
