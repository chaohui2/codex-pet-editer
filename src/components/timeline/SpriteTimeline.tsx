import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Clock,
  GripVertical,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { useAnimationPlayer } from '../../hooks/useAnimationPlayer';
import { getFramePosition } from '../../utils/spriteUtils';

export const SpriteTimeline: React.FC = () => {
  const { pet, spritesheet, selectedAnimation, selectedFrame, setSelectedAnimation, setSelectedFrame } =
    useEditorStore();
  const { toggle, isPlaying, stepForward, stepBackward } = useAnimationPlayer();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [trackZoom, setTrackZoom] = useState(1);

  const frameSize = 80 * trackZoom;

  useEffect(() => {
    if (scrollRef.current && selectedAnimation) {
      const animation = pet?.animations.find((a) => a.name === selectedAnimation);
      if (animation && selectedFrame < animation.frames) {
        const gap = 4;
        const frameWithGap = frameSize + gap;
        const scrollX = selectedFrame * frameWithGap - 200;
        scrollRef.current.scrollLeft = Math.max(0, scrollX);
      }
    }
  }, [selectedFrame, selectedAnimation, frameSize, pet?.animations]);

  const handleFrameClick = (animationName: string, frame: number) => {
    setSelectedAnimation(animationName);
    setSelectedFrame(frame);
  };

  const handleTrackClick = (animationName: string) => {
    setSelectedAnimation(animationName);
    if (!selectedAnimation || selectedAnimation !== animationName) {
      setSelectedFrame(0);
    }
  };

  if (!pet || !spritesheet) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Maximize2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">加载宠物数据以显示时间轴</p>
        </div>
      </div>
    );
  }

  const maxFrames = Math.max(...pet.animations.map((a) => a.frames));

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800 border-b border-gray-700 shrink-0">
        <div className="flex items-center gap-4">
          {/* 播放控制 */}
          <div className="flex items-center gap-1 bg-gray-900 rounded-lg p-1">
            <button
              onClick={stepBackward}
              className="p-1.5 rounded hover:bg-gray-700 text-gray-300 transition-colors"
              title="上一帧"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={toggle}
              className="p-2 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              title={isPlaying ? '暂停' : '播放'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              onClick={stepForward}
              className="p-1.5 rounded hover:bg-gray-700 text-gray-300 transition-colors"
              title="下一帧"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* 当前帧信息 */}
          <div className="flex items-center gap-2 text-sm">
            <Clock size={14} className="text-gray-400" />
            <span className="text-white font-mono">
              {selectedAnimation
                ? `${selectedAnimation}: ${selectedFrame + 1}/${
                    pet.animations.find((a) => a.name === selectedAnimation)?.frames || 0
                  }`
                : '选择动画'}
            </span>
            <span className="text-gray-500">| {pet.fps} FPS</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-900 rounded-lg px-2 py-1">
          <button
            onClick={() => setTrackZoom(Math.max(0.5, trackZoom - 0.25))}
            className="p-1.5 rounded hover:bg-gray-700 text-gray-300 transition-colors"
            title="缩小"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs text-gray-400 w-12 text-center font-mono">
            {Math.round(trackZoom * 100)}%
          </span>
          <button
            onClick={() => setTrackZoom(Math.min(2.5, trackZoom + 0.25))}
            className="p-1.5 rounded hover:bg-gray-700 text-gray-300 transition-colors"
            title="放大"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      {/* 帧刻度 */}
      <div className="relative h-8 bg-gray-850 border-b border-gray-700 shrink-0 overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full flex items-end"
          style={{ paddingLeft: '180px' }}
        >
          {Array.from({ length: maxFrames }).map((_, i) => (
            <div
              key={i}
              className="relative"
              style={{ width: frameSize }}
            >
              <div
                className={`absolute bottom-0 w-px ${
                  i % 5 === 0 ? 'bg-gray-500 h-4' : 'bg-gray-600 h-2'
                }`}
                style={{ left: frameSize / 2 }}
              />
              {i % 5 === 0 && (
                <span className="absolute bottom-5 text-[10px] text-gray-500 transform -translate-x-1/2 left-1/2 font-mono">
                  {i + 1}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 轨道区域 */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div className="relative min-w-full">
          {pet.animations.map((animation) => {
            const isSelected = selectedAnimation === animation.name;
            const isCurrentFrameInTrack =
              isSelected && selectedFrame >= 0 && selectedFrame < animation.frames;

            return (
              <div
                key={animation.name}
                className={`flex border-b border-gray-700/50 transition-colors ${
                  isSelected ? 'bg-blue-900/20' : 'hover:bg-gray-800/30'
                }`}
              >
                {/* 轨道头部 */}
                <div
                  className="flex items-center gap-2 px-3 py-2 border-r border-gray-700 bg-gray-800/90 cursor-pointer shrink-0 sticky left-0 z-10"
                  style={{ width: '180px' }}
                  onClick={() => handleTrackClick(animation.name)}
                >
                  <GripVertical size={14} className="text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-xs font-medium truncate ${
                        isSelected ? 'text-blue-400' : 'text-white'
                      }`}
                    >
                      {animation.name}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {animation.frames} 帧
                    </div>
                  </div>
                </div>

                {/* 轨道内容 - 精灵图帧序列 */}
                <div className="relative flex-1 py-2 px-2 min-w-0">
                  <div className="relative flex gap-1">
                    {Array.from({ length: animation.frames }).map((_, frameIndex) => {
                      const isCurrentFrame = isSelected && selectedFrame === frameIndex;
                      const pos = getFramePosition(
                        animation.row,
                        frameIndex,
                        pet.frameWidth,
                        pet.frameHeight
                      );

                      return (
                        <div
                          key={frameIndex}
                          onClick={() => handleFrameClick(animation.name, frameIndex)}
                          className={`
                            relative cursor-pointer rounded transition-all shrink-0 overflow-hidden
                            ${
                              isCurrentFrame
                                ? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-gray-900 z-10 shadow-lg shadow-blue-500/30'
                                : isSelected
                                ? 'ring-1 ring-blue-600/40 hover:ring-blue-500/60'
                                : 'ring-1 ring-gray-700 hover:ring-gray-500'
                            }
                          `}
                          style={{
                            width: frameSize,
                            height: frameSize,
                          }}
                        >
                          {/* 精灵图帧 */}
                          <div
                            className="absolute inset-0 checkerboard"
                            style={{
                              backgroundImage: `url(${spritesheet.src})`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: `-${pos.x * (frameSize / pet.frameWidth)}px -${
                                pos.y * (frameSize / pet.frameHeight)
                              }px`,
                              backgroundSize: `${
                                spritesheet.naturalWidth * (frameSize / pet.frameWidth)
                              }px ${spritesheet.naturalHeight * (frameSize / pet.frameHeight)}px`,
                              imageRendering: 'pixelated',
                            }}
                          />

                          {/* 帧号 */}
                          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2">
                            <span
                              className={`text-[9px] px-1 rounded font-mono ${
                                isCurrentFrame
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-black/60 text-gray-300'
                              }`}
                            >
                              {frameIndex + 1}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 播放头 */}
                  {isCurrentFrameInTrack && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
                      style={{
                        left: `calc(8px + ${selectedFrame * (frameSize + 4) + frameSize / 2}px)`,
                      }}
                    >
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rotate-45 shadow-lg" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部状态栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-t border-gray-700 shrink-0">
        <div className="text-xs text-gray-400">
          {pet.displayName} · {pet.frameWidth} × {pet.frameHeight}
        </div>
        <div className="text-xs text-gray-400">
          共 {pet.animations.length} 个动画 · {pet.animations.reduce((sum, a) => sum + a.frames, 0)} 帧
        </div>
      </div>
    </div>
  );
};
