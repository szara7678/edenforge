import React, { useState, useRef, useEffect } from 'react';

interface DraggablePanelProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  width?: number;
  height?: number;
  onPositionChange?: (position: { x: number; y: number }) => void;
}

export const DraggablePanel: React.FC<DraggablePanelProps> = ({
  title,
  children,
  onClose,
  initialPosition = { x: 10, y: 10 },
  width = 350,
  height = 400,
  onPositionChange
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

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

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // 화면 경계 체크
      const maxX = window.innerWidth - width;
      const maxY = window.innerHeight - height;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (onPositionChange) {
      onPositionChange(position);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={panelRef}
      className="draggable-panel"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: width,
        height: height,
        zIndex: isDragging ? 10000 : 1000
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
    </div>
  );
}; 