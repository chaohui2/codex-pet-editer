import React, { useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Maximize2 } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { useAnimationPlayer } from '../../hooks/useAnimationPlayer';
import { getFramePosition } from '../../utils/spriteUtils';

export const PreviewPlayer: React.FC = () => {
  const {
    pet,
    spritesheet,
    selectedAnimation,
    selectedFrame,
    onionSkinEnabled,
    onionSkinPrevFrames,
    onionSkinNextFrames,
  } = useEditorStore();
  const { toggle, stepForward, stepBackward, isPlaying } = useAnimationPlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pet || !spritesheet || !selectedAnimation) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = pet.frameWidth;
    canvas.height = pet.frameHeight;

    const animation = pet.animations.find((a) => a.name === selectedAnimation);
    if (!animation) return;

    const frame = Math.min(selectedFrame, animation.frames - 1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制洋葱皮 - 前几帧（绿色）
    if (onionSkinEnabled) {
      for (let i = 1; i <= onionSkinPrevFrames; i++) {
        const prevFrame = frame - i;
        if (prevFrame >= 0) {
          const pos = getFramePosition(animation.row, prevFrame, pet.frameWidth, pet.frameHeight);
          const opacity = 0.5;

          // 直接绘制半透明的前帧
          ctx.globalAlpha = opacity;
          ctx.drawImage(
            spritesheet,
            pos.x,
            pos.y,
            pet.frameWidth,
            pet.frameHeight,
            0,
            0,
            pet.frameWidth,
            pet.frameHeight
          );
        }
      }

      // 绘制洋葱皮 - 后几帧（红色）
      for (let i = 1; i <= onionSkinNextFrames; i++) {
        const nextFrame = frame + i;
        if (nextFrame < animation.frames) {
          const pos = getFramePosition(animation.row, nextFrame, pet.frameWidth, pet.frameHeight);
          const opacity = 0.5;

          // 直接绘制半透明的后帧
          ctx.globalAlpha = opacity;
          ctx.drawImage(
            spritesheet,
            pos.x,
            pos.y,
            pet.frameWidth,
            pet.frameHeight,
            0,
            0,
            pet.frameWidth,
            pet.frameHeight
          );
        }
      }

      ctx.globalAlpha = 1;
    }

    // 绘制当前帧
    const currentPos = getFramePosition(animation.row, frame, pet.frameWidth, pet.frameHeight);
    ctx.drawImage(
      spritesheet,
      currentPos.x,
      currentPos.y,
      pet.frameWidth,
      pet.frameHeight,
      0,
      0,
      pet.frameWidth,
      pet.frameHeight
    );
  }, [pet, spritesheet, selectedAnimation, selectedFrame, onionSkinEnabled, onionSkinPrevFrames, onionSkinNextFrames]);

  if (!pet || !selectedAnimation) {
    return (
      <div className="flex flex-col items-center justify-center h-24 bg-gray-900 rounded-lg border border-gray-700">
        <Maximize2 className="w-6 h-6 text-gray-500 mb-1" />
        <p className="text-gray-400 text-[10px]">在时间轴选择动画</p>
      </div>
    );
  }

  const animation = pet.animations.find((a) => a.name === selectedAnimation);
  if (!animation) return null;

  return (
    <div className="flex flex-col bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      <div className="flex justify-center p-2 checkerboard">
        <canvas
          ref={canvasRef}
          className="border border-gray-600 rounded w-full"
          style={{
            maxWidth: pet.frameWidth * 1.2,
            height: 'auto',
            aspectRatio: `${pet.frameWidth}/${pet.frameHeight}`,
            imageRendering: 'pixelated'
          }}
        />
      </div>

      <div className="p-2 border-t border-gray-700">
        <div className="flex items-center justify-center gap-2 mb-1">
          <button
            onClick={stepBackward}
            className="p-1 rounded hover:bg-gray-700 text-gray-300 transition-colors"
            title="上一帧"
          >
            <SkipBack size={12} />
          </button>
          <button
            onClick={toggle}
            className="p-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            title={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={stepForward}
            className="p-1 rounded hover:bg-gray-700 text-gray-300 transition-colors"
            title="下一帧"
          >
            <SkipForward size={12} />
          </button>
        </div>

        <div className="text-center text-gray-400 text-[10px]">
          帧: {selectedFrame + 1}/{animation.frames}
        </div>
      </div>
    </div>
  );
};
