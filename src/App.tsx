import React from 'react';
import { useEditorStore } from './store/useEditorStore';
import { Header } from './components/layout/Header';
import { FileDropZone } from './components/layout/FileDropZone';
import { PropertiesPanel } from './components/panel/PropertiesPanel';
import { SpriteTimeline } from './components/timeline/SpriteTimeline';

function App() {
  const { pet } = useEditorStore();

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* 精灵图时间轴主区域 */}
        <main className="flex-1 relative overflow-hidden">
          {pet ? (
            <FileDropZone>
              <SpriteTimeline />
            </FileDropZone>
          ) : (
            <div className="p-8 h-full flex items-center justify-center">
              <FileDropZone />
            </div>
          )}
        </main>

        {/* 右侧属性面板 */}
        {pet && <PropertiesPanel />}
      </div>
    </div>
  );
}

export default App;
