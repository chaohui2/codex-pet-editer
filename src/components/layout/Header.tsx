import React, { useState, useEffect } from 'react';
import { Cat, Download, X, Check } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import {
  serializePetJson,
  downloadFile,
  downloadCanvasAsImage,
  createAlignedSpritesheet,
} from '../../utils/petParser';

interface ExportFormData {
  id: string;
  displayName: string;
  description: string;
  exportAligned: boolean;
}

// 默认导出表单值（不使用juzi）
const DEFAULT_EXPORT_FORM: ExportFormData = {
  id: 'new-pet',
  displayName: 'New Pet',
  description: 'A cute desktop pet for Codex.',
  exportAligned: false,
};

export const Header: React.FC = () => {
  const { pet, spritesheet, frameOffsets } = useEditorStore();
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [formData, setFormData] = useState<ExportFormData>(DEFAULT_EXPORT_FORM);

  // 打开对话框时，使用当前pet的数据填充表单
  useEffect(() => {
    if (showExportDialog && pet) {
      setFormData({
        id: pet.id || DEFAULT_EXPORT_FORM.id,
        displayName: pet.displayName || DEFAULT_EXPORT_FORM.displayName,
        description: pet.description || DEFAULT_EXPORT_FORM.description,
        exportAligned: frameOffsets.size > 0,
      });
    }
  }, [showExportDialog, pet, frameOffsets.size]);

  const handleExport = () => {
    if (!pet || !spritesheet) return;

    // 更新pet数据
    const updatedPet = {
      ...pet,
      id: formData.id,
      displayName: formData.displayName,
      description: formData.description,
    };

    // 导出JSON
    const json = serializePetJson(updatedPet, frameOffsets);
    downloadFile(json, `${formData.id}.json`, 'application/json');

    // 导出图片
    if (formData.exportAligned && frameOffsets.size > 0) {
      const canvas = createAlignedSpritesheet(spritesheet, updatedPet, frameOffsets);
      downloadCanvasAsImage(canvas, `${formData.id}.webp`, 'webp', 0.95);
    } else {
      const canvas = document.createElement('canvas');
      canvas.width = spritesheet.naturalWidth;
      canvas.height = spritesheet.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(spritesheet, 0, 0);
        downloadCanvasAsImage(canvas, `${formData.id}.webp`, 'webp', 0.95);
      }
    }

    setShowExportDialog(false);
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
                onClick={() => setShowExportDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                title="导出宠物文件"
              >
                <Download size={18} />
                导出
              </button>
            </>
          )}
        </div>
      </div>

      {/* 导出对话框 */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">导出宠物</h2>
              <button
                onClick={() => setShowExportDialog(false)}
                className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  ID
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="例如: boba"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  显示名称
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="例如: Boba"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder="例如: A tiny otter sipping bubble tea..."
                />
              </div>

              {frameOffsets.size > 0 && (
                <label className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-900 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.exportAligned}
                    onChange={(e) => setFormData({ ...formData, exportAligned: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                  />
                  <div>
                    <span className="text-sm font-medium text-white">导出对齐后的精灵图</span>
                    <p className="text-xs text-gray-400 mt-0.5">应用 {frameOffsets.size} 个偏移到精灵图</p>
                  </div>
                </label>
              )}
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-gray-700 bg-gray-850 rounded-b-xl">
              <button
                onClick={() => setShowExportDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleExport}
                disabled={!formData.id || !formData.displayName}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                <Check size={16} />
                导出
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
