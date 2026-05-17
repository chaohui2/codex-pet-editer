import React from 'react';
import { Eye, Info } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { PreviewPlayer } from '../editor/PreviewPlayer';

export const PropertiesPanel: React.FC = () => {
  const { pet, selectedAnimation } = useEditorStore();

  if (!pet) return null;

  const animation = selectedAnimation
    ? pet.animations.find((a) => a.name === selectedAnimation)
    : null;

  return (
    <div className="w-72 bg-gray-800 border-l border-gray-700 overflow-y-auto flex flex-col h-full">
      {/* 预览播放器 */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Eye size={14} className="text-green-400" />
          <span className="text-white text-sm font-medium">预览</span>
        </div>
        <PreviewPlayer />
      </div>

      {/* 选中动画信息 */}
      {animation && (
        <div className="p-3 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Info size={14} className="text-purple-400" />
            <span className="text-white text-sm font-medium">动画信息</span>
          </div>
          <div className="bg-gray-900 rounded-lg p-2.5 space-y-1.5">
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
      <div className="p-3 mt-auto">
        <div className="bg-gray-900 rounded-lg p-2.5 space-y-1.5">
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
