import React, { useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Maximize2 } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { useAnimationPlayer } from '../../hooks/useAnimationPlayer';
import { getFramePosition } from '../../utils/spriteUtils';

export const PreviewPlayer: React.FC = () => {
  const { pet, spritesheet, selectedAnimation, selectedFrame } = useEditorStore();
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
    const pos = getFramePosition(animation.row, frame, pet.frameWidth, pet.frameHeight);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
  }, [pet, spritesheet, selectedAnimation, selectedFrame]);

  if (!pet || !selectedAnimation) {
    return (
      <div className="flex flex-col items-center justify-center h-32 bg-gray-900 rounded-lg border border-gray-700">
        <Maximize2 className="w-8 h-8 text-gray-500 mb-2" />
        <p className="text-gray-400 text-xs">在时间轴选择动画</p>
      </div>
    );
  }

  const animation = pet.animations.find((a) => a.name === selectedAnimation);
  if (!animation) return null;

  return (
    <div className="flex flex-col bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      <div className="flex justify-center p-3 checkerboard">
        <canvas
          ref={canvasRef}
          className="border border-gray-600 rounded"
          style={{ width: pet.frameWidth * 1.5, height: pet.frameHeight * 1.5, imageRendering: 'pixelated' }}
        />
      </div>

      <div className="p-3 border-t border-gray-700">
        <div className="flex items-center justify-center gap-3 mb-2">
          <button
            onClick={stepBackward}
            className="p-1.5 rounded hover:bg-gray-700 text-gray-300 transition-colors"
            title="上一帧"
          >
            <SkipBack size={16} />
          </button>
          <button
            onClick={toggle}
            className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            title={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button
            onClick={stepForward}
            className="p-1.5 rounded hover:bg-gray-700 text-gray-300 transition-colors"
            title="下一帧"
          >
            <SkipForward size={16} />
          </button>
        </div>

        <div className="flex justify-between text-gray-400 text-xs">
          <span>
            帧: {selectedFrame + 1}/{animation.frames}
          </span>
          <span>{animation.loop ? '🔁' : '⏹'}</span>
        </div>
      </div>
    </div>
  );
};
