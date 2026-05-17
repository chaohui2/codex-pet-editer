import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Maximize2, Move } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { useAnimationPlayer } from '../../hooks/useAnimationPlayer';
import { getFramePosition, getFrameKey, getDefaultFrameOffset } from '../../utils/spriteUtils';

export const PreviewPlayer: React.FC = () => {
  const {
    pet,
    spritesheet,
    selectedAnimation,
    selectedFrame,
    frameOffsets,
    onionSkinEnabled,
    onionSkinPrevFrames,
    onionSkinNextFrames,
    setFrameOffset,
    resetFrameOffset,
  } = useEditorStore();
  const { toggle, stepForward, stepBackward, isPlaying } = useAnimationPlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScaling, setIsScaling] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scaleStart, setScaleStart] = useState({ scale: 1, y: 0 });
  const [showOffset, setShowOffset] = useState(false);

  const getCurrentOffset = useCallback(() => {
    if (!selectedAnimation) return getDefaultFrameOffset();
    const key = getFrameKey(selectedAnimation, selectedFrame);
    return frameOffsets.get(key) || getDefaultFrameOffset();
  }, [selectedAnimation, selectedFrame, frameOffsets]);

  const renderFrame = useCallback((
    ctx: CanvasRenderingContext2D,
    animation: { name: string; row: number; frames: number },
    frame: number,
    baseOpacity: number = 1,
    tintColor?: { r: number; g: number; b: number }
  ) => {
    if (!pet || !spritesheet) return;

    const key = getFrameKey(animation.name, frame);
    const offset = frameOffsets.get(key) || getDefaultFrameOffset();
    const pos = getFramePosition(animation.row, frame, pet.frameWidth, pet.frameHeight);

    const scale = offset.scale || 1;
    const destWidth = pet.frameWidth * scale;
    const destHeight = pet.frameHeight * scale;
    const offsetX = (pet.frameWidth - destWidth) / 2 + offset.x;
    const offsetY = (pet.frameHeight - destHeight) / 2 + offset.y;

    if (tintColor) {
      ctx.save();
      ctx.globalAlpha = baseOpacity;
      ctx.drawImage(
        spritesheet,
        pos.x,
        pos.y,
        pet.frameWidth,
        pet.frameHeight,
        offsetX,
        offsetY,
        destWidth,
        destHeight
      );
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = `rgba(${tintColor.r}, ${tintColor.g}, ${tintColor.b}, ${baseOpacity * 0.6})`;
      ctx.fillRect(offsetX, offsetY, destWidth, destHeight);
      ctx.restore();
    } else {
      ctx.globalAlpha = baseOpacity;
      ctx.drawImage(
        spritesheet,
        pos.x,
        pos.y,
        pet.frameWidth,
        pet.frameHeight,
        offsetX,
        offsetY,
        destWidth,
        destHeight
      );
      ctx.globalAlpha = 1;
    }
  }, [pet, spritesheet, frameOffsets]);

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

    // 绘制洋葱皮 - 前几帧（绿色滤镜）
    if (onionSkinEnabled) {
      for (let i = 1; i <= onionSkinPrevFrames; i++) {
        let prevFrame = frame - i;
        if (prevFrame < 0) {
          prevFrame = animation.frames + prevFrame;
        }
        const opacity = 0.7 - (i - 1) * 0.15;
        renderFrame(ctx, animation, prevFrame, Math.max(0.3, opacity), { r: 0, g: 255, b: 0 });
      }

      // 绘制洋葱皮 - 后几帧（红色滤镜）
      for (let i = 1; i <= onionSkinNextFrames; i++) {
        let nextFrame = frame + i;
        if (nextFrame >= animation.frames) {
          nextFrame = nextFrame - animation.frames;
        }
        const opacity = 0.7 - (i - 1) * 0.15;
        renderFrame(ctx, animation, nextFrame, Math.max(0.3, opacity), { r: 255, g: 0, b: 0 });
      }
    }

    // 绘制当前帧
    renderFrame(ctx, animation, frame, 1);

    // 绘制偏移指示器
    if (showOffset) {
      const offset = getCurrentOffset();
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(offset.x, offset.y, pet.frameWidth, pet.frameHeight);
      ctx.setLineDash([]);
    }
  }, [
    pet,
    spritesheet,
    selectedAnimation,
    selectedFrame,
    frameOffsets,
    onionSkinEnabled,
    onionSkinPrevFrames,
    onionSkinNextFrames,
    renderFrame,
    showOffset,
    getCurrentOffset,
  ]);

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedAnimation || !pet) return;

      const key = getFrameKey(selectedAnimation, selectedFrame);
      const currentOffset = frameOffsets.get(key) || getDefaultFrameOffset();
      const step = e.shiftKey ? 5 : 1;

      let dx = 0;
      let dy = 0;
      let handled = false;

      switch (e.key) {
        case 'ArrowUp':
          dy = -step;
          handled = true;
          break;
        case 'ArrowDown':
          dy = step;
          handled = true;
          break;
        case 'ArrowLeft':
          dx = -step;
          handled = true;
          break;
        case 'ArrowRight':
          dx = step;
          handled = true;
          break;
        case 'r':
        case 'R':
          resetFrameOffset(key);
          handled = true;
          break;
      }

      if (dx !== 0 || dy !== 0) {
        setFrameOffset(key, {
          x: currentOffset.x + dx,
          y: currentOffset.y + dy,
          scale: currentOffset.scale,
        });
      }

      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAnimation, selectedFrame, frameOffsets, setFrameOffset, resetFrameOffset, pet]);

  // 位置拖拽处理
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!selectedAnimation || !pet) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = pet.frameWidth / rect.width;
    const scaleY = pet.frameHeight / rect.height;

    setIsDragging(true);
    setDragStart({
      x: e.clientX * scaleX,
      y: e.clientY * scaleY,
    });
  };

  // 缩放手柄拖拽处理
  const handleScaleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedAnimation || !pet) return;

    const key = getFrameKey(selectedAnimation, selectedFrame);
    const currentOffset = frameOffsets.get(key) || getDefaultFrameOffset();

    setIsScaling(true);
    setScaleStart({
      scale: currentOffset.scale,
      y: e.clientY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // 缩放拖拽
    if (isScaling && selectedAnimation && pet) {
      const deltaY = scaleStart.y - e.clientY;
      const scaleDelta = deltaY * 0.005; // 灵敏度
      const newScale = Math.max(0.5, Math.min(2, scaleStart.scale + scaleDelta));

      const key = getFrameKey(selectedAnimation, selectedFrame);
      const currentOffset = frameOffsets.get(key) || getDefaultFrameOffset();

      setFrameOffset(key, {
        ...currentOffset,
        scale: newScale,
      });
      return;
    }

    // 位置拖拽
    if (!isDragging || !selectedAnimation || !pet) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = pet.frameWidth / rect.width;
    const scaleY = pet.frameHeight / rect.height;

    const mouseX = e.clientX * scaleX;
    const mouseY = e.clientY * scaleY;

    const key = getFrameKey(selectedAnimation, selectedFrame);
    const currentOffset = frameOffsets.get(key) || getDefaultFrameOffset();

    setFrameOffset(key, {
      x: currentOffset.x + (mouseX - dragStart.x),
      y: currentOffset.y + (mouseY - dragStart.y),
      scale: currentOffset.scale,
    });

    setDragStart({ x: mouseX, y: mouseY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsScaling(false);
  };

  // 全局监听鼠标抬起，防止拖出画布外不松开
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setIsScaling(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // 滚轮缩放处理
  const handleWheel = (e: React.WheelEvent) => {
    if (!selectedAnimation || !pet) return;
    if (!e.altKey) return;

    e.preventDefault();

    const key = getFrameKey(selectedAnimation, selectedFrame);
    const currentOffset = frameOffsets.get(key) || getDefaultFrameOffset();

    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    const newScale = Math.max(0.5, Math.min(2, currentOffset.scale + delta));

    setFrameOffset(key, {
      x: currentOffset.x,
      y: currentOffset.y,
      scale: newScale,
    });
  };

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

  const currentOffset = getCurrentOffset();

  return (
    <div className="flex flex-col bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      <div
        ref={containerRef}
        className="flex justify-center p-2 checkerboard relative"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas
          ref={canvasRef}
          className={`border border-gray-600 rounded w-full transition-all ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            maxWidth: pet.frameWidth * 1.2,
            height: 'auto',
            aspectRatio: `${pet.frameWidth}/${pet.frameHeight}`,
            imageRendering: 'pixelated',
          }}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
          tabIndex={0}
        />
        {/* 偏移指示器 */}
        {(Math.abs(currentOffset.x) > 0.1 || Math.abs(currentOffset.y) > 0.1 || Math.abs(currentOffset.scale - 1) > 0.01) && (
          <div className="absolute top-3 left-3 bg-black/70 text-white text-[10px] px-2 py-1 rounded font-mono">
            X: {currentOffset.x.toFixed(0)} Y: {currentOffset.y.toFixed(0)}
            {Math.abs(currentOffset.scale - 1) > 0.01 && ` S: ${currentOffset.scale.toFixed(2)}`}
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-1">
          <button
            onClick={() => setShowOffset(!showOffset)}
            className={`p-1 rounded ${
              showOffset ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
            } hover:bg-gray-600 transition-colors`}
            title="显示偏移参考线"
          >
            <Move size={12} />
          </button>
        </div>

        {/* 缩放手柄 - 右下角 */}
        {selectedAnimation && (
          <div
            className={`absolute bottom-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center cursor-ns-resize transition-all ${
              isScaling
                ? 'bg-yellow-500 text-gray-900 scale-110'
                : 'bg-gray-700 hover:bg-yellow-600 text-yellow-400 hover:text-white'
            }`}
            onMouseDown={handleScaleMouseDown}
            title="拖拽调整大小"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              className={isScaling ? 'animate-pulse' : ''}
            >
              <path d="M7 2v2H5v2H3v2h2V6h2V2h2zM7 14v-2H5v-2H3v2h2v2h2v-2zm6-6h-2v2h-2v2h2v-2h2V8z" />
            </svg>
          </div>
        )}
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

        {/* 快捷键提示 */}
        <div className="mt-2 pt-2 border-t border-gray-700">
          <p className="text-gray-500 text-[9px] text-center">
            ↑↓←→ 移动 | Shift+方向键 快移 | Alt+滚轮 缩放 | R 重置
          </p>
        </div>
      </div>
    </div>
  );
};
