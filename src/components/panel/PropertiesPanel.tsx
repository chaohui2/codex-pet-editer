import React from 'react';
import { Eye, Info, Layers } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { PreviewPlayer } from '../editor/PreviewPlayer';

export const PropertiesPanel: React.FC = () => {
  const {
    pet,
    selectedAnimation,
    onionSkinEnabled,
    onionSkinPrevFrames,
    onionSkinNextFrames,
    setOnionSkinEnabled,
    setOnionSkinPrevFrames,
    setOnionSkinNextFrames,
  } = useEditorStore();

  if (!pet) return null;

  const animation = selectedAnimation
    ? pet.animations.find((a) => a.name === selectedAnimation)
    : null;

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
              {pet.frameWidth}×{pet.frameHeight}
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
        </div>
      </div>
    </div>
  );
};
