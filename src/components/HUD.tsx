

import React from 'react';

interface HUDProps {
  entityCount: number;
  tick: number;
  isRunning: boolean;
  speed: number;
  onTogglePause: () => void;
  onChangeSpeed: (speed: number) => void;
}

const HUD: React.FC<HUDProps> = ({ 
  entityCount, 
  tick, 
  isRunning, 
  speed, 
  onTogglePause, 
  onChangeSpeed 
}) => {
  return (
    <div style={{
      position: 'absolute',
      top: 10,
      left: 10,
      zIndex: 1000,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontFamily: 'Noto Sans KR, sans-serif',
      fontSize: '14px'
    }}>
      <div>엔티티: {entityCount}</div>
      <div>Tick: {tick}</div>
      <div>시간: {Math.floor(tick / 10)}초</div>
      
      <div style={{ marginTop: '10px' }}>
        <button 
          onClick={onTogglePause}
          style={{
            backgroundColor: isRunning ? '#ff6b6b' : '#4ecdc4',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            marginRight: '5px'
          }}
        >
          {isRunning ? '일시정지' : '재생'}
        </button>
        
        <select 
          value={speed} 
          onChange={(e) => onChangeSpeed(Number(e.target.value))}
          style={{
            backgroundColor: '#333',
            color: 'white',
            border: '1px solid #555',
            padding: '3px',
            borderRadius: '3px'
          }}
        >
          <option value={0.1}>0.1x</option>
          <option value={0.2}>0.2x</option>
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={4}>4x</option>
        </select>
      </div>
    </div>
  );
};

export default HUD; 