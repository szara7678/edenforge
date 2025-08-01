import { GameLog, LogLevel, LogCategory } from '../types';

interface LogPanelProps {
  logs: GameLog[];
  onClearLogs?: () => void;
}

const LogPanel: React.FC<LogPanelProps> = ({ logs, onClearLogs }) => {
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
      default: return '📝';
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

  return (
    <div style={{
      position: 'absolute',
      bottom: 10,
      right: 420, // UnifiedPanel 옆으로 이동
      width: '350px',
      height: '300px',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontFamily: 'Noto Sans KR, sans-serif',
      fontSize: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        borderBottom: '1px solid #333',
        paddingBottom: '5px'
      }}>
        <h3 style={{ margin: 0, fontSize: '14px' }}>📋 게임 로그</h3>
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
              fontSize: '10px'
            }}
          >
            지우기
          </button>
        )}
      </div>
      
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column-reverse' // 최신 로그가 아래에
      }}>
        {logs.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            opacity: 0.5,
            fontStyle: 'italic'
          }}>
            로그가 없습니다...
          </div>
        ) : (
          logs.slice(-50).reverse().map((log) => (
          <div 
            key={log.id}
            style={{
              marginBottom: '5px',
              padding: '5px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '3px',
              borderLeft: `3px solid ${getLevelColor(log.level)}`
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '2px'
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
              <span style={{ marginLeft: 'auto', fontSize: '10px', opacity: 0.7 }}>
                {formatTime(log.timestamp)}
              </span>
            </div>
            <div style={{ fontSize: '11px' }}>
              {log.message}
            </div>
            {log.entityName && (
              <div style={{ 
                fontSize: '10px', 
                opacity: 0.7, 
                fontStyle: 'italic',
                marginTop: '2px'
              }}>
                👤 {log.entityName}
              </div>
            )}
          </div>
        ))
        )}
      </div>
    </div>
  );
};

export default LogPanel; 