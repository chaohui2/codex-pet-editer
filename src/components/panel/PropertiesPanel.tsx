import React from 'react';
import { Eye, Info, Layers, RotateCcw, Target } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { PreviewPlayer } from '../editor/PreviewPlayer';
import { getFrameKey } from '../../utils/spriteUtils';
import { useLanguage } from '../../i18n';

export const PropertiesPanel: React.FC = () => {
  const { t } = useLanguage();
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
      {/* Preview Player */}
      <div className="p-2 border-b border-gray-700">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Eye size={12} className="text-green-400" />
          <span className="text-white text-xs font-medium">{t('properties.preview')}</span>
        </div>
        <PreviewPlayer />
      </div>

      {/* Frame Alignment Controls */}
      {selectedAnimation && (
        <div className="p-2 border-b border-gray-700">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Target size={12} className="text-yellow-400" />
            <span className="text-white text-xs font-medium">{t('properties.frameAdjust')}</span>
          </div>

          <div className="bg-gray-900 rounded-lg p-2">
            <p className="text-gray-500 text-[10px] mb-2 text-center leading-relaxed">
              {t('properties.dragHint').split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i === 0 && <br />}
                </React.Fragment>
              ))}
            </p>

            {/* Reset Buttons */}
            <div className="flex gap-1.5">
              <button
                onClick={handleResetCurrent}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-[11px] rounded transition-colors"
              >
                <RotateCcw size={12} />
                {t('properties.resetCurrent')}
              </button>
              <button
                onClick={resetAllFrameOffsets}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-900/50 hover:bg-red-800/50 text-red-400 text-[11px] rounded transition-colors"
              >
                <RotateCcw size={12} />
                {t('properties.resetAll')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onion Skin Controls */}
      {pet && (
        <div className="p-2 border-b border-gray-700">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Layers size={12} className="text-cyan-400" />
            <span className="text-white text-xs font-medium">{t('properties.onionSkin')}</span>
          </div>
          <div className="bg-gray-900 rounded-lg p-2 space-y-2">
            {/* Toggle */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-gray-400">{t('properties.enabled')}</span>
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
                {/* Previous Frames */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">{t('properties.prevFrames')}</span>
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

                {/* Next Frames */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">{t('properties.nextFrames')}</span>
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

      {/* Selected Animation Info */}
      {animation && (
        <div className="p-2 border-b border-gray-700">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Info size={12} className="text-purple-400" />
            <span className="text-white text-xs font-medium">{t('properties.animationInfo')}</span>
          </div>
          <div className="bg-gray-900 rounded-lg p-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">{t('properties.name')}</span>
              <span className="text-white font-mono">{animation.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">{t('properties.row')}</span>
              <span className="text-white font-mono">#{animation.row + 1}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">{t('properties.frames')}</span>
              <span className="text-white font-mono">{animation.frames}</span>
            </div>
            <div className="pt-1.5 border-t border-gray-700">
              <p className="text-gray-400 text-xs">{animation.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Pet Basic Info */}
      <div className="p-2 mt-auto">
        <div className="bg-gray-900 rounded-lg p-2 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">{t('properties.petInfo.pet')}</span>
            <span className="text-white font-mono">{pet.displayName}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">{t('properties.petInfo.frameSize')}</span>
            <span className="text-white font-mono">
              {pet.frameWidth} × {pet.frameHeight}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">{t('properties.petInfo.animationCount')}</span>
            <span className="text-white font-mono">{pet.animations.length}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">{t('properties.petInfo.fps')}</span>
            <span className="text-white font-mono">{pet.fps}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">{t('properties.petInfo.offsetFrames')}</span>
            <span className="text-white font-mono">{frameOffsets.size}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
