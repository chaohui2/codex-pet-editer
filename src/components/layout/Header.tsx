import React, { useState } from 'react';
import { Cat, FileJson, Image, Download, ChevronDown } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import {
  serializePetJson,
  downloadFile,
  downloadCanvasAsImage,
  createAlignedSpritesheet,
} from '../../utils/petParser';

export const Header: React.FC = () => {
  const { pet, spritesheet, frameOffsets } = useEditorStore();
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExportJson = () => {
    if (!pet) return;
    const json = serializePetJson(pet, frameOffsets);
    downloadFile(json, `${pet.id || 'pet'}.json`, 'application/json');
    setShowExportMenu(false);
  };

  const handleExportOriginalImage = () => {
    if (!spritesheet) return;

    const canvas = document.createElement('canvas');
    canvas.width = spritesheet.naturalWidth;
    canvas.height = spritesheet.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(spritesheet, 0, 0);
    downloadCanvasAsImage(canvas, 'spritesheet.webp', 'webp', 0.95);
    setShowExportMenu(false);
  };

  const handleExportAlignedImage = () => {
    if (!spritesheet || !pet) return;

    const canvas = createAlignedSpritesheet(spritesheet, pet, frameOffsets);
    downloadCanvasAsImage(canvas, 'spritesheet-aligned.webp', 'webp', 0.95);
    setShowExportMenu(false);
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Cat className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Codex Pet 编辑器</h1>
            <p className="text-gray-400 text-sm">桌面宠物精灵图编辑工具</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pet && (
            <>
              <div className="px-3 py-1 bg-gray-700 rounded text-gray-300 text-sm mr-4">
                <span className="text-blue-400">{pet.displayName}</span>
                <span className="text-gray-500 mx-2">·</span>
                <span>{pet.frameWidth} × {pet.frameHeight}</span>
                <span className="text-gray-500 mx-2">·</span>
                <span>{pet.animations.length} 动画</span>
                {frameOffsets.size > 0 && (
                  <>
                    <span className="text-gray-500 mx-2">·</span>
                    <span className="text-yellow-400">{frameOffsets.size} 偏移</span>
                  </>
                )}
              </div>

              <button
                onClick={handleExportJson}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                title="导出包含偏移数据的 JSON 文件"
              >
                <FileJson size={18} />
                导出 JSON
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <Image size={18} />
                  导出图片
                  <ChevronDown size={14} />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
                    <button
                      onClick={handleExportOriginalImage}
                      className="w-full flex items-center gap-2 px-4 py-3 text-left text-white hover:bg-gray-800 transition-colors rounded-t-lg"
                    >
                      <Download size={16} />
                      <div>
                        <div className="text-sm font-medium">原始精灵图</div>
                        <div className="text-xs text-gray-400">直接导出原始图片</div>
                      </div>
                    </button>
                    <button
                      onClick={handleExportAlignedImage}
                      className={`w-full flex items-center gap-2 px-4 py-3 text-left text-white hover:bg-gray-800 transition-colors rounded-b-lg ${
                        frameOffsets.size === 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={frameOffsets.size === 0}
                    >
                      <Download size={16} className={frameOffsets.size > 0 ? 'text-yellow-400' : ''} />
                      <div>
                        <div className="text-sm font-medium flex items-center gap-2">
                          对齐后精灵图
                          {frameOffsets.size > 0 && (
                            <span className="text-yellow-400 text-xs">已应用偏移</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          将偏移和缩放应用到每帧后导出
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
