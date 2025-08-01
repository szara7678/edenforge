import React, { useState, useRef, useEffect } from 'react';

interface FloatingPanelProps {
  title: string;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  onClose?: () => void;
  zIndex?: number;
}

export const FloatingPanel: React.FC<FloatingPanelProps> = ({
  title,
  children,
  defaultPosition = { x: 10, y: 10 },
  defaultSize = { width: 300, height: 200 },
  onClose,
  zIndex = 1000
}) => {
  const [position, setPosition] = useState(defaultPosition);
  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // 헤더 영역에서만 드래그 가능하도록 수정
    const target = e.target as HTMLElement;
    if (target.closest('[data-draggable="true"]')) {
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
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        border: '1px solid #333',
        borderRadius: '8px',
        color: 'white',
        fontFamily: 'Noto Sans KR, sans-serif',
        fontSize: '12px',
        zIndex,
        cursor: isDragging ? 'grabbing' : 'default',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* 헤더 */}
      <div
        data-draggable="true"
        style={{
          padding: '8px 12px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid #333',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'grab'
        }}
      >
        <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{title}</div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ff6b6b',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '0',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        )}
      </div>
      
      {/* 컨텐츠 */}
      <div style={{ padding: '12px', height: 'calc(100% - 40px)', overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
}; 