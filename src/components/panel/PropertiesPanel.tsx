import React from 'react';
import { Eye, Info, Layers, RotateCcw, Target } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { PreviewPlayer } from '../editor/PreviewPlayer';
import { getFrameKey } from '../../utils/spriteUtils';

export const PropertiesPanel: React.FC = () => {
  const {
    pet,
    selectedAnimation,
    selectedFrame,
    frameOffsets,
    onionSkinEnabled,
    onionSkinPrevFrames,
    onionSkinNextFrames,
    resetFrameOffset,
    resetAllFrameOffsets,
    setOnionSkinEnabled,
    setOnionSkinPrevFrames,
    setOnionSkinNextFrames,
  } = useEditorStore();

  const handleResetCurrent = () => {
    if (!selectedAnimation) return;
    const key = getFrameKey(selectedAnimation, selectedFrame);
    resetFrameOffset(key);
  };

  const animation = selectedAnimation
    ? pet?.animations.find((a) => a.name === selectedAnimation)
    : null;

  if (!pet) return null;

  return (
    <div className="w-full h-full bg-gray-800 border-l border-gray-700 overflow-y-auto flex flex-col">
      {/* 预览播放器 */}
      <div className="p-2 border-b border-gray-700">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Eye size={12} className="text-green-400" />
          <span className="text-white text-xs font-medium">预览</span>
        </div>
        <PreviewPlayer />
      </div>

      {/* 帧对齐控制 */}
      {selectedAnimation && (
        <div className="p-2 border-b border-gray-700">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Target size={12} className="text-yellow-400" />
            <span className="text-white text-xs font-medium">帧调整</span>
          </div>

          <div className="bg-gray-900 rounded-lg p-2">
            <p className="text-gray-500 text-[10px] mb-2 text-center leading-relaxed">
              🖱️ 拖拽画布移动位置
              <br />
              📐 拖拽右下角调整大小
            </p>

            {/* 重置按钮 */}
            <div className="flex gap-1.5">
              <button
                onClick={handleResetCurrent}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-[11px] rounded transition-colors"
              >
                <RotateCcw size={12} />
                重置当前
              </button>
              <button
                onClick={resetAllFrameOffsets}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-900/50 hover:bg-red-800/50 text-red-400 text-[11px] rounded transition-colors"
              >
                <RotateCcw size={12} />
                重置全部
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 洋葱皮控制 */}
      {pet && (
        <div className="p-2 border-b border-gray-700">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Layers size={12} className="text-cyan-400" />
            <span className="text-white text-xs font-medium">洋葱皮</span>
          </div>
          <div className="bg-gray-900 rounded-lg p-2 space-y-2">
            {/* 开关 */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-gray-400">启用</span>
              <div
                className={`w-8 h-4 rounded-full transition-colors ${
                  onionSkinEnabled ? 'bg-cyan-600' : 'bg-gray-600'
                }`}
                onClick={() => setOnionSkinEnabled(!onionSkinEnabled)}
              >
                <div
                  className={`w-3 h-3 bg-white rounded-full transition-transform mt-0.5 ${
                    onionSkinEnabled ? 'ml-4' : 'ml-0.5'
                  }`}
                />
              </div>
            </label>

            {onionSkinEnabled && (
              <>
                {/* 前帧数量 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">前帧</span>
                    <span className="text-white font-mono">{onionSkinPrevFrames}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={onionSkinPrevFrames}
                    onChange={(e) => setOnionSkinPrevFrames(Number(e.target.value))}
                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                {/* 后帧数量 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">后帧</span>
                    <span className="text-white font-mono">{onionSkinNextFrames}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={onionSkinNextFrames}
                    onChange={(e) => setOnionSkinNextFrames(Number(e.target.value))}
                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 选中动画信息 */}
      {animation && (
        <div className="p-2 border-b border-gray-700">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Info size={12} className="text-purple-400" />
            <span className="text-white text-xs font-medium">动画信息</span>
          </div>
          <div className="bg-gray-900 rounded-lg p-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">名称</span>
              <span className="text-white font-mono">{animation.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">行</span>
              <span className="text-white font-mono">#{animation.row + 1}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">帧数</span>
              <span className="text-white font-mono">{animation.frames}</span>
            </div>
            <div className="pt-1.5 border-t border-gray-700">
              <p className="text-gray-400 text-xs">{animation.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* 宠物基本信息 */}
      <div className="p-2 mt-auto">
        <div className="bg-gray-900 rounded-lg p-2 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">宠物</span>
            <span className="text-white font-mono">{pet.displayName}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">帧尺寸</span>
            <span className="text-white font-mono">
              {pet.frameWidth} × {pet.frameHeight}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">动画数</span>
            <span className="text-white font-mono">{pet.animations.length}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">FPS</span>
            <span className="text-white font-mono">{pet.fps}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">偏移帧</span>
            <span className="text-white font-mono">{frameOffsets.size}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
