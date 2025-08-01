import React from 'react';
import { WorldState } from '../types';

interface GameInfoPanelProps {
  worldState: WorldState;
  isRunning: boolean;
  speed: number;
  onTogglePause: () => void;
  onChangeSpeed: (speed: number) => void;
}

export const GameInfoPanel: React.FC<GameInfoPanelProps> = ({
  worldState,
  isRunning,
  speed,
  onTogglePause,
  onChangeSpeed
}) => {
  return (
    <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
      {/* 기본 정보 */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ marginBottom: '5px', color: '#4ecdc4', fontWeight: 'bold' }}>기본 정보</div>
        <div>엔티티: {worldState.entities.length}</div>
        <div>Tick: {worldState.tick}</div>
        <div>시간: {Math.floor(worldState.tick / 10)}초</div>
      </div>

      {/* 통계 정보 */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ marginBottom: '5px', color: '#4ecdc4', fontWeight: 'bold' }}>통계</div>
        <div>로그 수: {worldState.logs.length}</div>
        <div>재료 수: {worldState.materials.length}</div>
        <div>파벌 수: {worldState.factions.length}</div>
        <div>동물 수: {worldState.animals.length}</div>
        <div>식물 수: {worldState.plants.length}</div>
      </div>

      {/* 컨트롤 */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ marginBottom: '5px', color: '#4ecdc4', fontWeight: 'bold' }}>컨트롤</div>
        <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
          <button 
            onClick={onTogglePause}
            style={{
              backgroundColor: isRunning ? '#ff6b6b' : '#4ecdc4',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            {isRunning ? '일시정지' : '재생'}
          </button>
          
          <select 
            value={speed} 
            onChange={(e) => onChangeSpeed(Number(e.target.value))}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid #333',
              padding: '4px 6px',
              borderRadius: '3px',
              fontSize: '10px'
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
    </div>
  );
}; 