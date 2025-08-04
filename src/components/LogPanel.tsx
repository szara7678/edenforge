import React, { useState, useMemo } from 'react';
import { GameLog, LogLevel, LogCategory } from '../types';

interface LogPanelProps {
  logs: GameLog[];
  onClearLogs?: () => void;
}

const LogPanel: React.FC<LogPanelProps> = ({ logs, onClearLogs }) => {
  const [filterCategory, setFilterCategory] = useState<LogCategory | 'all'>('all');
  const [filterLevel, setFilterLevel] = useState<LogLevel | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getLevelColor = (level: LogLevel): string => {
    switch (level) {
      case 'info': return '#4ecdc4';
      case 'warning': return '#ffd93d';
      case 'error': return '#ff6b6b';
      case 'success': return '#6bcf7f';
      default: return '#ffffff';
    }
  };

  const getCategoryIcon = (category: LogCategory): string => {
    switch (category) {
      case 'entity': return '👤';
      case 'material': return '🔧';
      case 'combat': return '⚔️';
      case 'research': return '🔬';
      case 'system': return '⚙️';
      case 'faction': return '⚔️';
      case 'genetics': return '🧬';
      case 'learning': return '📚';
      case 'emotion': return '💭';
      case 'hunting': return '🏹';
      default: return '📝';
    }
  };

  const getCategoryName = (category: LogCategory): string => {
    switch (category) {
      case 'entity': return '엔티티';
      case 'material': return '재료';
      case 'combat': return '전투';
      case 'research': return '연구';
      case 'system': return '시스템';
      case 'faction': return '파벌';
      case 'genetics': return '유전';
      case 'learning': return '학습';
      case 'emotion': return '감정';
      case 'hunting': return '사냥';
      default: return '기타';
    }
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  // 필터링된 로그
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // 카테고리 필터
      if (filterCategory !== 'all' && log.category !== filterCategory) {
        return false;
      }
      
      // 레벨 필터
      if (filterLevel !== 'all' && log.level !== filterLevel) {
        return false;
      }
      
      // 검색어 필터
      if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !(log.entityName && log.entityName.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }
      
      return true;
    });
  }, [logs, filterCategory, filterLevel, searchTerm]);

  const categories: Array<{ value: LogCategory | 'all'; label: string; icon: string }> = [
    { value: 'all', label: '전체', icon: '📋' },
    { value: 'entity', label: '엔티티', icon: '👤' },
    { value: 'material', label: '재료', icon: '🔧' },
    { value: 'combat', label: '전투', icon: '⚔️' },
    { value: 'hunting', label: '사냥', icon: '🏹' },
    { value: 'faction', label: '파벌', icon: '⚔️' },
    { value: 'genetics', label: '유전', icon: '🧬' },
    { value: 'learning', label: '학습', icon: '📚' },
    { value: 'emotion', label: '감정', icon: '💭' },
    { value: 'system', label: '시스템', icon: '⚙️' }
  ];

  const levels: Array<{ value: LogLevel | 'all'; label: string; color: string }> = [
    { value: 'all', label: '전체', color: '#ffffff' },
    { value: 'info', label: '정보', color: '#4ecdc4' },
    { value: 'warning', label: '경고', color: '#ffd93d' },
    { value: 'error', label: '오류', color: '#ff6b6b' },
    { value: 'success', label: '성공', color: '#6bcf7f' }
  ];

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontSize: '12px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#4ecdc4', fontSize: '14px' }}>📋 게임 로그</h3>
      
      {/* 필터 컨트롤 */}
      <div style={{ marginBottom: '15px' }}>
        {/* 검색 */}
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="검색어 입력..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#2a2a2a',
              border: '1px solid #4ecdc4',
              borderRadius: '4px',
              color: 'white',
              fontSize: '11px',
              outline: 'none'
            }}
          />
        </div>
        
        {/* 카테고리 필터 */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '10px', marginBottom: '5px', opacity: 0.7 }}>카테고리</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {categories.map(cat => {
              const logCount = cat.value === 'all' 
                ? logs.length 
                : logs.filter(log => log.category === cat.value).length;
              
              return (
                <button
                  key={cat.value}
                  onClick={() => setFilterCategory(cat.value)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: filterCategory === cat.value ? '#4ecdc4' : 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  {cat.icon} {cat.label} ({logCount})
                </button>
              );
            })}
          </div>
        </div>
        
        {/* 레벨 필터 */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '10px', marginBottom: '5px', opacity: 0.7 }}>레벨</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {levels.map(level => (
              <button
                key={level.value}
                onClick={() => setFilterLevel(level.value)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: filterLevel === level.value ? level.color : 'rgba(255, 255, 255, 0.1)',
                  color: filterLevel === level.value ? 'black' : 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '10px'
                }}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* 로그 목록 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column-reverse' // 최신 로그가 아래에
      }}>
        {filteredLogs.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            opacity: 0.5,
            fontStyle: 'italic'
          }}>
            {logs.length === 0 ? '로그가 없습니다...' : '필터 조건에 맞는 로그가 없습니다.'}
          </div>
        ) : (
          filteredLogs.slice(-100).reverse().map((log) => (
            <div 
              key={log.id}
              style={{
                marginBottom: '5px',
                padding: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '4px',
                borderLeft: `3px solid ${getLevelColor(log.level)}`
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '3px'
              }}>
                <span style={{ marginRight: '5px' }}>
                  {getCategoryIcon(log.category)}
                </span>
                <span style={{ 
                  color: getLevelColor(log.level),
                  fontWeight: 'bold',
                  fontSize: '10px'
                }}>
                  {log.level.toUpperCase()}
                </span>
                <span style={{ 
                  marginLeft: '5px',
                  fontSize: '10px',
                  opacity: 0.7,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '3px'
                }}>
                  {getCategoryName(log.category)}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '10px', opacity: 0.7 }}>
                  {formatTime(log.timestamp)}
                </span>
              </div>
              <div style={{ fontSize: '11px', lineHeight: '1.3' }}>
                {log.message}
              </div>
              {log.entityName && (
                <div style={{ 
                  fontSize: '10px', 
                  opacity: 0.7, 
                  fontStyle: 'italic',
                  marginTop: '3px'
                }}>
                  👤 {log.entityName}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* 로그 정보 */}
      <div style={{
        marginTop: '10px',
        padding: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '4px',
        fontSize: '10px',
        opacity: 0.7
      }}>
        <div style={{ marginBottom: '5px' }}>
          총 {logs.length}개 로그 중 {filteredLogs.length}개 표시
          {onClearLogs && (
            <button 
              onClick={onClearLogs}
              style={{
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                padding: '3px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '10px',
                marginLeft: '10px'
              }}
            >
              로그 지우기
            </button>
          )}
        </div>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '5px',
          fontSize: '9px'
        }}>
          {categories.slice(1).map(cat => {
            const logCount = logs.filter(log => log.category === cat.value).length;
            if (logCount === 0) return null;
            
            return (
              <span key={cat.value} style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '2px 6px',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}>
                {cat.icon} {logCount}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LogPanel; 