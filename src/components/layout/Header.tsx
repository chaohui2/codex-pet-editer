import React from 'react';
import { Cat, FileJson, Image } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { serializePetJson, downloadFile, downloadCanvasAsImage } from '../../utils/petParser';

export const Header: React.FC = () => {
  const { pet, spritesheet } = useEditorStore();

  const handleExportJson = () => {
    if (!pet) return;
    const json = serializePetJson(pet);
    downloadFile(json, `${pet.id || 'pet'}.json`, 'application/json');
  };

  const handleExportImage = () => {
    if (!spritesheet) return;

    const canvas = document.createElement('canvas');
    canvas.width = spritesheet.naturalWidth;
    canvas.height = spritesheet.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(spritesheet, 0, 0);
    downloadCanvasAsImage(canvas, 'spritesheet.webp', 'webp', 0.95);
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
              </div>

              <button
                onClick={handleExportJson}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <FileJson size={18} />
                导出 JSON
              </button>

              <button
                onClick={handleExportImage}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Image size={18} />
                导出图片
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
