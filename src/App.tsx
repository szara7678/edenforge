import { useEffect, useRef, useState } from 'react';
import { World } from './core/world';
import { WorldState } from './types';
import { parameterManager } from './parameters';
import CanvasLayer from './components/CanvasLayer';
import { TabManager } from './components/TabManager';
import { FloatingPanel } from './components/FloatingPanel';
import { GameInfoPanel } from './components/GameInfoPanel';
import { BubbleFilterPanel, BubbleFilters } from './components/BubbleFilterPanel';
import './styles/App.css';

function App() {
  const [world, setWorld] = useState(() => new World());
  const [gameState, setGameState] = useState(world.getState());
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(0.2); // 기본 속도를 0.2로 설정
  const [showGameInfo, setShowGameInfo] = useState(true);
  const [showBubbleFilter, setShowBubbleFilter] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [bubbleFilters, setBubbleFilters] = useState<BubbleFilters>({
    showEntityBubbles: true,
    showFactionBubbles: true,
    showMaterialBubbles: true,
    showAnimalBubbles: true,
    showPlantBubbles: true,
    showEmotions: true,
    showActions: true,
    showThoughts: true,
    showSpeech: true,
    selectedEntities: [],
    selectedFactions: [],
    selectedCategories: []
  });
  const animationRef = useRef<number>();

  useEffect(() => {
    // 이미 초기화되었다면 중복 실행 방지
    if (isInitialized) return;
    
    // 파라미터 시스템 초기화
    parameterManager.loadParameters();
    parameterManager.resetToDefaults();
    
    // 초기 월드 생성 (한 번만 실행)
    const initialHumanCount = parameterManager.getParameter('world', 'initialHumanCount');
    console.log('초기 인간 수 설정:', initialHumanCount);
    world.generatePrimitives(initialHumanCount);
    setGameState(world.getState());
    setIsInitialized(true);
  }, [isInitialized]); // isInitialized 의존성 추가

  useEffect(() => {
    let lastTickTime = 0;
    const tickInterval = 1000 / (60 * speed); // 속도에 따른 틱 간격

    const gameLoop = (currentTime: number) => {
      if (isRunning && currentTime - lastTickTime >= tickInterval) {
        world.tick();
        setGameState(world.getState());
        lastTickTime = currentTime;
      }
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop(0);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, speed]); // 게임 루프만 재시작

  const togglePause = () => {
    setIsRunning(!isRunning);
  };

  const changeSpeed = (newSpeed: number) => {
    setSpeed(newSpeed);
  };

  // 게임 저장/불러오기 기능
  const saveGame = () => {
    try {
      const savedGames = JSON.parse(localStorage.getItem('edenforge_saved_games') || '[]');
      savedGames.push(gameState);
      localStorage.setItem('edenforge_saved_games', JSON.stringify(savedGames));
      console.log('게임이 저장되었습니다.');
    } catch (error) {
      console.error('게임 저장 중 오류:', error);
    }
  };

  const loadGame = (savedState: WorldState) => {
    try {
      // 새로운 월드 인스턴스 생성
      const newWorld = new World();
      
      // 저장된 상태로 월드 복원
      newWorld.loadState(savedState);
      
      setWorld(newWorld);
      setGameState(savedState);
      setIsRunning(false); // 로드 후 일시정지
      
      console.log('게임이 불러와졌습니다.');
    } catch (error) {
      console.error('게임 불러오기 중 오류:', error);
    }
  };

  const newGame = () => {
    try {
      const newWorld = new World();
      newWorld.generatePrimitives(24);
      
      setWorld(newWorld);
      setGameState(newWorld.getState());
      setIsRunning(true);
      
      console.log('새 게임이 시작되었습니다.');
    } catch (error) {
      console.error('새 게임 시작 중 오류:', error);
    }
  };

  const resetSettings = () => {
    try {
      // 패널 설정 초기화
      localStorage.removeItem('edenforge_panel_settings');
      
      // 기타 설정들도 초기화
      setSpeed(0.2);
      setShowGameInfo(true);
      setShowBubbleFilter(false);
      
      console.log('설정이 초기화되었습니다.');
    } catch (error) {
      console.error('설정 초기화 중 오류:', error);
    }
  };

  return (
    <div className="App">
      <CanvasLayer worldState={gameState} bubbleFilters={bubbleFilters} />
      <TabManager 
        gameState={gameState} 
        onNewGame={newGame}
        onLoadGame={loadGame}
        onSaveGame={saveGame}
        onResetSettings={resetSettings}
      />
      
      {/* 게임 정보 플로팅 패널 */}
      {showGameInfo && (
        <FloatingPanel
          title="게임 정보"
          defaultPosition={{ x: 10, y: 10 }}
          defaultSize={{ width: 350, height: 300 }}
          onClose={() => setShowGameInfo(false)}
        >
          <GameInfoPanel
            worldState={gameState}
            isRunning={isRunning}
            speed={speed}
            onTogglePause={togglePause}
            onChangeSpeed={changeSpeed}
          />
        </FloatingPanel>
      )}

      {/* 말풍선 필터 플로팅 패널 */}
      {showBubbleFilter && (
        <FloatingPanel
          title="말풍선 필터"
          defaultPosition={{ x: 270, y: 10 }}
          defaultSize={{ width: 280, height: 400 }}
          onClose={() => setShowBubbleFilter(false)}
        >
          <BubbleFilterPanel
            worldState={gameState}
            onFilterChange={setBubbleFilters}
          />
        </FloatingPanel>
      )}

      {/* 플로팅 패널 토글 버튼들 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <button
          onClick={() => setShowGameInfo(!showGameInfo)}
          style={{
            backgroundColor: showGameInfo ? '#4ecdc4' : '#333',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          {showGameInfo ? '게임 정보 숨기기' : '게임 정보 보기'}
        </button>
        
        <button
          onClick={() => setShowBubbleFilter(!showBubbleFilter)}
          style={{
            backgroundColor: showBubbleFilter ? '#4ecdc4' : '#333',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          {showBubbleFilter ? '말풍선 필터 숨기기' : '말풍선 필터 보기'}
        </button>
      </div>
    </div>
  );
}

export default App; 