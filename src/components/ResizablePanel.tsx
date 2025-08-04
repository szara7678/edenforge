import React, { useState, useRef, useEffect } from 'react';

interface ResizablePanelProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  title,
  children,
  onClose,
  initialPosition = { x: 10, y: 10 },
  initialSize = { width: 500, height: 600 },
  minSize = { width: 100, height: 200 },
  maxSize = { width: 1200, height: 800 },
  onPositionChange,
  onSizeChange
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  // 드래그 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      const rect = panelRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  // 리사이즈 핸들러
  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // 화면 경계 체크
      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height;
      
      const newPosition = {
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      };
      
      setPosition(newPosition);
    }

    if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = position.x;
      let newY = position.y;

      if (resizeDirection.includes('e')) {
        newWidth = Math.max(minSize.width, Math.min(maxSize.width, resizeStart.width + deltaX));
      }
      if (resizeDirection.includes('w')) {
        const widthChange = Math.max(-resizeStart.width + minSize.width, Math.min(0, deltaX));
        newWidth = resizeStart.width - widthChange;
        newX = position.x + widthChange;
      }
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(minSize.height, Math.min(maxSize.height, resizeStart.height + deltaY));
      }
      if (resizeDirection.includes('n')) {
        const heightChange = Math.max(-resizeStart.height + minSize.height, Math.min(0, deltaY));
        newHeight = resizeStart.height - heightChange;
        newY = position.y + heightChange;
      }

      // 화면 경계 체크
      const maxX = window.innerWidth - newWidth;
      const maxY = window.innerHeight - newHeight;
      
      setSize({ width: newWidth, height: newHeight });
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (onPositionChange) {
        onPositionChange(position);
      }
    }
    if (isResizing) {
      setIsResizing(false);
      setResizeDirection('');
      if (onSizeChange) {
        onSizeChange(size);
      }
    }
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, resizeStart, resizeDirection]);

  return (
    <div
      ref={panelRef}
      className="resizable-panel"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: (isDragging || isResizing) ? 10000 : 1000
      }}
    >
      <div 
        className="panel-header"
        onMouseDown={handleMouseDown}
      >
        <div className="panel-title">{title}</div>
        <button className="panel-close-btn" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="panel-content">
        {children}
      </div>
      
      {/* 리사이즈 핸들 */}
      <div 
        className="resize-handle resize-handle-n"
        onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          cursor: 'ns-resize'
        }}
      />
      <div 
        className="resize-handle resize-handle-s"
        onMouseDown={(e) => handleResizeMouseDown(e, 's')}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          cursor: 'ns-resize'
        }}
      />
      <div 
        className="resize-handle resize-handle-w"
        onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          cursor: 'ew-resize'
        }}
      />
      <div 
        className="resize-handle resize-handle-e"
        onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          cursor: 'ew-resize'
        }}
      />
      
      {/* 코너 리사이즈 핸들 */}
      <div 
        className="resize-handle resize-handle-nw"
        onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '8px',
          height: '8px',
          cursor: 'nw-resize'
        }}
      />
      <div 
        className="resize-handle resize-handle-ne"
        onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '8px',
          height: '8px',
          cursor: 'ne-resize'
        }}
      />
      <div 
        className="resize-handle resize-handle-sw"
        onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '8px',
          height: '8px',
          cursor: 'sw-resize'
        }}
      />
      <div 
        className="resize-handle resize-handle-se"
        onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '8px',
          height: '8px',
          cursor: 'se-resize'
        }}
      />
    </div>
  );
}; 