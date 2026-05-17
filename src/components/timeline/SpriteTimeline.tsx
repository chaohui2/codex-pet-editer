import React, { useRef, useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Plus,
  Trash2,
  ImagePlus,
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { useAnimationPlayer } from '../../hooks/useAnimationPlayer';
import { getFramePosition } from '../../utils/spriteUtils';
import { loadImage } from '../../utils/petParser';

export const SpriteTimeline: React.FC = () => {
  const {
    pet,
    spritesheet,
    selectedAnimation,
    selectedFrame,
    setSelectedAnimation,
    setSelectedFrame,
    addFrameToAnimation,
    replaceSelectedFrame,
    deleteFrame,
  } = useEditorStore();
  const { toggle, isPlaying, stepForward, stepBackward } = useAnimationPlayer();
  const scrollRef = useRef<HTMLDivElement>(null);
  const replaceFrameInputRef = useRef<HTMLInputElement>(null);
  const addFrameInputRef = useRef<HTMLInputElement>(null);
  const [trackZoom, setTrackZoom] = useState(1);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    animationName: string;
    frameIndex: number;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    animationName: string;
    frameIndex: number;
  } | null>(null);

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

  const handleContextMenu = (
    e: React.MouseEvent,
    animationName: string,
    frameIndex: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!pet) return;
    const animation = pet.animations.find((a) => a.name === animationName);
    if (animation && animation.frames <= 1) return; // 至少保留1帧
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      animationName,
      frameIndex,
    });
  };

  const handleReplaceFrame = () => {
    if (!contextMenu) return;
    setSelectedAnimation(contextMenu.animationName);
    setSelectedFrame(contextMenu.frameIndex);
    setContextMenu(null);
    replaceFrameInputRef.current?.click();
  };

  const handleAddFrame = () => {
    if (!contextMenu) return;
    setSelectedAnimation(contextMenu.animationName);
    setContextMenu(null);
    addFrameInputRef.current?.click();
  };

  const handleAddFrameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedAnimation) return;

    try {
      const url = URL.createObjectURL(file);
      const img = await loadImage(url);
      await addFrameToAnimation(selectedAnimation, img);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('添加帧失败:', error);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleReplaceFrameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = URL.createObjectURL(file);
      const img = await loadImage(url);
      await replaceSelectedFrame(img);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('替换帧失败:', error);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleDeleteFrameClick = () => {
    if (!contextMenu) return;
    setShowDeleteConfirm({
      animationName: contextMenu.animationName,
      frameIndex: contextMenu.frameIndex,
    });
    setContextMenu(null);
  };

  const handleConfirmDelete = async () => {
    if (!showDeleteConfirm) return;
    try {
      await deleteFrame(showDeleteConfirm.animationName, showDeleteConfirm.frameIndex);
    } catch (error) {
      console.error('删除帧失败:', error);
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

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
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 border-b border-gray-700 shrink-0">
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
      <div className="relative h-6 bg-gray-850 border-b border-gray-700 shrink-0 overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full flex items-end"
          style={{ paddingLeft: '120px' }}
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
                  className="flex items-center gap-1.5 px-2 py-1.5 border-r border-gray-700 bg-gray-800/90 cursor-pointer shrink-0 sticky left-0 z-10"
                  style={{ width: '120px' }}
                  onClick={() => handleTrackClick(animation.name)}
                >
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
                <div className="relative flex-1 py-1.5 px-1.5 min-w-0">
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
                          onContextMenu={(e) => handleContextMenu(e, animation.name, frameIndex)}
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
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 border-t border-gray-700 shrink-0">
        <div className="text-xs text-gray-400">
          {pet.displayName} · {pet.frameWidth} × {pet.frameHeight}
        </div>
        <div className="text-xs text-gray-400">
          共 {pet.animations.length} 个动画 · {pet.animations.reduce((sum, a) => sum + a.frames, 0)} 帧
        </div>
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-1 min-w-[140px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleAddFrame}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-400 hover:bg-gray-700 transition-colors"
          >
            <Plus size={16} />
            添加新帧
          </button>
          <button
            onClick={handleReplaceFrame}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <ImagePlus size={16} />
            替换帧
          </button>
          <button
            onClick={handleDeleteFrameClick}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
          >
            <Trash2 size={16} />
            删除帧
          </button>
        </div>
      )}

      {/* 删除确认对话框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-4 max-w-sm">
            <h3 className="text-white text-sm font-medium mb-3">确认删除帧</h3>
            <p className="text-gray-400 text-xs mb-4">
              确定要删除动画「{showDeleteConfirm.animationName}」的第 {showDeleteConfirm.frameIndex + 1} 帧吗？此操作不可撤销。
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 隐藏的替换帧文件输入 */}
      <input
        ref={replaceFrameInputRef}
        type="file"
        accept="image/*"
        onChange={handleReplaceFrameChange}
        className="hidden"
      />
      {/* 隐藏的添加帧文件输入 */}
      <input
        ref={addFrameInputRef}
        type="file"
        accept="image/*"
        onChange={handleAddFrameChange}
        className="hidden"
      />
    </div>
  );
};
