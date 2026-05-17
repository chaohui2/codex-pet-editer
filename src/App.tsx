import { useState, useCallback, useRef, useEffect } from 'react';
import { useEditorStore } from './store/useEditorStore';
import { Header } from './components/layout/Header';
import { FileDropZone } from './components/layout/FileDropZone';
import { PropertiesPanel } from './components/panel/PropertiesPanel';
import { SpriteTimeline } from './components/timeline/SpriteTimeline';
import { GripVertical } from 'lucide-react';

function App() {
  const { pet } = useEditorStore();
  const [panelWidth, setPanelWidth] = useState(240);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = containerRect.right - e.clientX;
      // 限制最小和最大宽度
      setPanelWidth(Math.max(180, Math.min(500, newWidth)));
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <Header />

      <div ref={containerRef} className="flex-1 flex overflow-hidden">
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

        {/* 可拖动分隔条 */}
        {pet && (
          <div
            className={`
              w-1 cursor-col-resize flex items-center justify-center
              bg-gray-700 hover:bg-blue-500 transition-colors
              ${isDragging ? 'bg-blue-500' : ''}
            `}
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center justify-center">
              <GripVertical size={14} className="text-gray-400" />
            </div>
          </div>
        )}

        {/* 右侧属性面板 */}
        {pet && (
          <div style={{ width: panelWidth }}>
            <PropertiesPanel />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
