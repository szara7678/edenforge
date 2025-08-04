import React, { useState } from 'react';
import { WorldState } from '../types';

interface SettingsPanelProps {
  worldState: WorldState;
  onNewGame: () => void;
  onLoadGame: (savedState: WorldState) => void;
  onSaveGame: () => void;
  onResetSettings: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  worldState,
  onNewGame,
  onLoadGame,
  onSaveGame,
  onResetSettings
}) => {
  const [activeTab, setActiveTab] = useState<'game' | 'display' | 'performance' | 'data'>('game');
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const tabs = [
    { id: 'game', name: '게임', icon: '🎮' },
    { id: 'display', name: '화면', icon: '🖥️' },
    { id: 'performance', name: '성능', icon: '⚡' },
    { id: 'data', name: '데이터', icon: '💾' }
  ];

  const renderGameTab = () => (
    <div className="settings-content">
      <div className="settings-section">
        <h3>게임 관리</h3>
        
        <div className="settings-group">
          <h4>게임 상태</h4>
          <div className="game-stats">
            <div className="stat-item">
              <span className="stat-label">틱:</span>
              <span className="stat-value">{worldState.tick}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">엔티티:</span>
              <span className="stat-value">{worldState.entities.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">파벌:</span>
              <span className="stat-value">{worldState.factions.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">동물:</span>
              <span className="stat-value">{worldState.animals.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">식물:</span>
              <span className="stat-value">{worldState.plants.length}</span>
            </div>
          </div>
        </div>

        <div className="settings-group">
          <h4>게임 제어</h4>
          <div className="button-group">
            <button 
              className="action-btn new-game-btn"
              onClick={() => setConfirmAction('newGame')}
            >
              🆕 새로하기
            </button>
            <button 
              className="action-btn save-game-btn"
              onClick={onSaveGame}
            >
              💾 저장하기
            </button>
            <button 
              className="action-btn load-game-btn"
              onClick={() => setConfirmAction('loadGame')}
            >
              📂 불러오기
            </button>
          </div>
        </div>

        <div className="settings-group">
          <h4>설정 초기화</h4>
          <button 
            className="action-btn reset-btn"
            onClick={() => setConfirmAction('resetSettings')}
          >
            🔄 설정 초기화
          </button>
        </div>
      </div>
    </div>
  );

  const renderDisplayTab = () => (
    <div className="settings-content">
      <div className="settings-section">
        <h3>화면 설정</h3>
        
        <div className="settings-group">
          <h4>시각 효과</h4>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              말풍선 표시
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              감정 이모지
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              파벌 색상 구분
            </label>
          </div>
        </div>

        <div className="settings-group">
          <h4>UI 설정</h4>
          <div className="setting-item">
            <label>패널 투명도:</label>
            <input type="range" min="0.1" max="1" step="0.1" defaultValue="0.9" />
          </div>
          <div className="setting-item">
            <label>글자 크기:</label>
            <select defaultValue="medium">
              <option value="small">작게</option>
              <option value="medium">보통</option>
              <option value="large">크게</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="settings-content">
      <div className="settings-section">
        <h3>성능 설정</h3>
        
        <div className="settings-group">
          <h4>렌더링 최적화</h4>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              엔티티 수 제한
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              말풍선 최적화
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              로그 제한
            </label>
          </div>
        </div>

        <div className="settings-group">
          <h4>성능 모니터링</h4>
          <div className="performance-stats">
            <div className="stat-item">
              <span className="stat-label">FPS:</span>
              <span className="stat-value">60</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">메모리:</span>
              <span className="stat-value">128MB</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">렌더링:</span>
              <span className="stat-value">16ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataTab = () => (
    <div className="settings-content">
      <div className="settings-section">
        <h3>데이터 관리</h3>
        
        <div className="settings-group">
          <h4>저장된 게임</h4>
          <div className="saved-games">
            {getSavedGames().map((game, index) => (
              <div key={index} className="saved-game-item">
                <div className="game-info">
                  <div className="game-name">저장된 게임 {index + 1}</div>
                  <div className="game-details">
                    틱: {game.tick} | 엔티티: {game.entities.length} | 파벌: {game.factions.length}
                  </div>
                </div>
                <div className="game-actions">
                  <button 
                    className="load-btn"
                    onClick={() => onLoadGame(game)}
                  >
                    불러오기
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => setConfirmAction(`deleteGame_${index}`)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
            {getSavedGames().length === 0 && (
              <div className="no-saves">
                저장된 게임이 없습니다.
              </div>
            )}
          </div>
        </div>

        <div className="settings-group">
          <h4>데이터 내보내기/가져오기</h4>
          <div className="button-group">
            <button className="action-btn export-btn">
              📤 내보내기
            </button>
            <button className="action-btn import-btn">
              📥 가져오기
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const getSavedGames = (): WorldState[] => {
    try {
      const saved = localStorage.getItem('edenforge_saved_games');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;

    switch (confirmAction) {
      case 'newGame':
        onNewGame();
        break;
      case 'loadGame':
        const savedGames = getSavedGames();
        if (savedGames.length > 0) {
          onLoadGame(savedGames[0]); // 첫 번째 저장된 게임 불러오기
        }
        break;
      case 'resetSettings':
        onResetSettings();
        break;
      default:
        if (confirmAction.startsWith('deleteGame_')) {
          const index = parseInt(confirmAction.split('_')[1]);
          const savedGames = getSavedGames();
          savedGames.splice(index, 1);
          localStorage.setItem('edenforge_saved_games', JSON.stringify(savedGames));
        }
        break;
    }
    setConfirmAction(null);
  };

  return (
    <div className="settings-panel">
      <div className="settings-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-name">{tab.name}</span>
          </button>
        ))}
      </div>

      <div className="settings-content-wrapper">
        {activeTab === 'game' && renderGameTab()}
        {activeTab === 'display' && renderDisplayTab()}
        {activeTab === 'performance' && renderPerformanceTab()}
        {activeTab === 'data' && renderDataTab()}
      </div>

      {/* 확인 모달 */}
      {confirmAction && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <h3>확인</h3>
            <p>
              {confirmAction === 'newGame' && '새 게임을 시작하시겠습니까? 현재 게임 데이터가 사라집니다.'}
              {confirmAction === 'loadGame' && '저장된 게임을 불러오시겠습니까? 현재 게임 데이터가 사라집니다.'}
              {confirmAction === 'resetSettings' && '모든 설정을 초기화하시겠습니까?'}
              {confirmAction.startsWith('deleteGame_') && '저장된 게임을 삭제하시겠습니까?'}
            </p>
            <div className="modal-actions">
              <button 
                className="confirm-btn"
                onClick={handleConfirmAction}
              >
                확인
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setConfirmAction(null)}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 