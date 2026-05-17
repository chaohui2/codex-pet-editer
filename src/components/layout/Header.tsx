import React, { useState, useEffect } from 'react';
import { Cat, Download, X, Check, Plus, Trash2, Globe } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import {
  serializePetJson,
  createAlignedSpritesheet,
  downloadPetAsZip,
} from '../../utils/petParser';
import { NewPetAnimationConfig, DEFAULT_PET } from '../../types/pet';
import { useLanguage } from '../../i18n';

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

interface NewPetFormData {
  frameWidth: number;
  frameHeight: number;
  columns: number;
  animations: NewPetAnimationConfig[];
}

const DEFAULT_NEW_PET_FORM: NewPetFormData = {
  frameWidth: 192,
  frameHeight: 208,
  columns: 8,
  animations: DEFAULT_PET.animations.map(a => ({
    name: a.name,
    frames: a.frames,
    loop: a.loop,
    description: a.description,
  })),
};

export const Header: React.FC = () => {
  const { pet, spritesheet, frameOffsets, createNewPet } = useEditorStore();
  const { t, currentLanguage, toggleLanguage } = useLanguage();
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [formData, setFormData] = useState<ExportFormData>(DEFAULT_EXPORT_FORM);
  const [newFormData, setNewFormData] = useState<NewPetFormData>(DEFAULT_NEW_PET_FORM);

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

  const handleExport = async () => {
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

    // 导出图片
    let canvas: HTMLCanvasElement;
    if (formData.exportAligned && frameOffsets.size > 0) {
      canvas = createAlignedSpritesheet(spritesheet, updatedPet, frameOffsets);
    } else {
      canvas = document.createElement('canvas');
      canvas.width = spritesheet.naturalWidth;
      canvas.height = spritesheet.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(spritesheet, 0, 0);
      }
    }

    // 导出为 zip 文件
    await downloadPetAsZip(json, canvas, formData.id, 0.95);

    setShowExportDialog(false);
  };

  const handleCreateNew = async () => {
    await createNewPet(newFormData);
    setShowNewDialog(false);
    setNewFormData(DEFAULT_NEW_PET_FORM);
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Cat className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{t('header.title')}</h1>
            <p className="text-gray-400 text-sm">{t('header.subtitle')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            title="Toggle Language"
          >
            <Globe size={18} />
            {currentLanguage.toUpperCase()}
          </button>
          <button
            onClick={() => setShowNewDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            title={t('header.newTooltip')}
          >
            <Plus size={18} />
            {t('header.new')}
          </button>

          {pet && (
            <>
              <div className="px-3 py-1 bg-gray-700 rounded text-gray-300 text-sm ml-2">
                <span className="text-blue-400">{pet.displayName}</span>
                <span className="text-gray-500 mx-2">·</span>
                <span>{pet.frameWidth} × {pet.frameHeight}</span>
                <span className="text-gray-500 mx-2">·</span>
                <span>{pet.animations.length} {t('common.animations')}</span>
                {frameOffsets.size > 0 && (
                  <>
                    <span className="text-gray-500 mx-2">·</span>
                    <span className="text-yellow-400">{frameOffsets.size} {t('common.offsets')}</span>
                  </>
                )}
              </div>

              <button
                onClick={() => setShowExportDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                title={t('header.export')}
              >
                <Download size={18} />
                {t('header.export')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">{t('header.exportDialog.title')}</h2>
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
                  {t('header.exportDialog.id')}
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder={t('header.exportDialog.idPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  {t('header.exportDialog.displayName')}
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Boba"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  {t('header.exportDialog.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder={t('header.exportDialog.descriptionPlaceholder')}
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
                    <span className="text-sm font-medium text-white">{t('header.exportDialog.exportAligned')}</span>
                    <p className="text-xs text-gray-400 mt-0.5">{t('header.exportDialog.exportAlignedDesc', { count: frameOffsets.size })}</p>
                  </div>
                </label>
              )}
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-gray-700 bg-gray-850 rounded-b-xl">
              <button
                onClick={() => setShowExportDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
              >
                {t('header.exportDialog.cancel')}
              </button>
              <button
                onClick={handleExport}
                disabled={!formData.id || !formData.displayName}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                <Check size={16} />
                {t('header.exportDialog.export')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Pet Dialog */}
      {showNewDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">{t('header.newDialog.title')}</h2>
              <button
                onClick={() => setShowNewDialog(false)}
                className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    {t('header.newDialog.frameWidth')}
                  </label>
                  <input
                    type="number"
                    value={newFormData.frameWidth}
                    onChange={(e) => setNewFormData({ ...newFormData, frameWidth: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    {t('header.newDialog.frameHeight')}
                  </label>
                  <input
                    type="number"
                    value={newFormData.frameHeight}
                    onChange={(e) => setNewFormData({ ...newFormData, frameHeight: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  {t('header.newDialog.columns')}
                </label>
                <input
                  type="number"
                  value={newFormData.columns}
                  onChange={(e) => setNewFormData({ ...newFormData, columns: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  min="1"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    {t('header.newDialog.animations')}
                  </label>
                  <button
                    onClick={() => setNewFormData({
                      ...newFormData,
                      animations: [...newFormData.animations, {
                        name: `Animation ${newFormData.animations.length + 1}`,
                        frames: 4,
                        loop: true,
                        description: '',
                      }]
                    })}
                    className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                  >
                    {t('header.newDialog.addAnimation')}
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {newFormData.animations.map((anim, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-900/50 rounded-lg">
                      <div className="w-6 h-6 flex items-center justify-center bg-gray-700 rounded text-gray-400 text-xs">
                        {index}
                      </div>
                      <input
                        type="text"
                        value={anim.name}
                        onChange={(e) => {
                          const newAnims = [...newFormData.animations];
                          newAnims[index] = { ...anim, name: e.target.value };
                          setNewFormData({ ...newFormData, animations: newAnims });
                        }}
                        className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                        placeholder={t('header.newDialog.animationName')}
                      />
                      <input
                        type="number"
                        value={anim.frames}
                        onChange={(e) => {
                          const newAnims = [...newFormData.animations];
                          newAnims[index] = { ...anim, frames: Math.max(1, parseInt(e.target.value) || 1) };
                          setNewFormData({ ...newFormData, animations: newAnims });
                        }}
                        className="w-16 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                        min="1"
                      />
                      <label className="flex items-center gap-1 text-xs text-gray-400">
                        <input
                          type="checkbox"
                          checked={anim.loop}
                          onChange={(e) => {
                            const newAnims = [...newFormData.animations];
                            newAnims[index] = { ...anim, loop: e.target.checked };
                            setNewFormData({ ...newFormData, animations: newAnims });
                          }}
                          className="w-3 h-3 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                        />
                        {t('header.newDialog.loop')}
                      </label>
                      {newFormData.animations.length > 1 && (
                        <button
                          onClick={() => {
                            const newAnims = newFormData.animations.filter((_, i) => i !== index);
                            setNewFormData({ ...newFormData, animations: newAnims });
                          }}
                          className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-gray-700 bg-gray-850 rounded-b-xl">
              <button
                onClick={() => setShowNewDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
              >
                {t('header.newDialog.cancel')}
              </button>
              <button
                onClick={handleCreateNew}
                disabled={!newFormData.frameWidth || !newFormData.frameHeight || !newFormData.columns || newFormData.animations.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                <Check size={16} />
                {t('header.newDialog.create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
