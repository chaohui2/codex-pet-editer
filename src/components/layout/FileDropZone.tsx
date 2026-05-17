import React from 'react';
import { Upload, Cat } from 'lucide-react';
import { useFileHandler } from '../../hooks/useFileHandler';

interface FileDropZoneProps {
  children?: React.ReactNode;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ children }) => {
  const { isDragging, error, handleDragOver, handleDragLeave, handleDrop, loadSamplePet } =
    useFileHandler();

  if (children) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="h-full relative"
      >
        {children}
        {isDragging && (
          <div className="absolute inset-0 bg-blue-500/30 border-4 border-blue-500 border-dashed flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-blue-600 px-6 py-3 rounded-lg text-white text-xl font-bold shadow-lg">
              释放文件以加载
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center h-full p-8 transition-colors ${
        isDragging
          ? 'bg-blue-500/20 border-blue-500'
          : 'bg-gray-800/50 border-gray-700'
      } border-2 border-dashed rounded-lg`}
    >
      <div className="p-4 bg-gray-700 rounded-full mb-4">
        <Upload className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-white text-lg font-medium mb-2">
        {isDragging ? '释放文件以加载' : '拖拽文件到此处'}
      </h3>
      <p className="text-gray-400 text-sm mb-6 text-center">
        同时拖拽 pet.json 和 spritesheet.webp
      </p>

      {error && (
        <div className="mb-4 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={loadSamplePet}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        <Cat size={20} />
        加载示例宠物 (Juzi)
      </button>
    </div>
  );
};
