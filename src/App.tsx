import { useEffect, useRef, useState } from 'react';
import { World } from './core/world';
import CanvasLayer from './components/CanvasLayer';
import { TabManager } from './components/TabManager';
import { FloatingPanel } from './components/FloatingPanel';
import { GameInfoPanel } from './components/GameInfoPanel';
import { BubbleFilterPanel, BubbleFilters } from './components/BubbleFilterPanel';
import './styles/App.css';

function App() {
  const [world] = useState(() => new World());
  const [gameState, setGameState] = useState(world.getState());
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(0.2); // 기본 속도를 0.2로 설정
  const [showGameInfo, setShowGameInfo] = useState(true);
  const [showBubbleFilter, setShowBubbleFilter] = useState(false);
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
    // 초기 월드 생성
    world.generatePrimitives(24);
    setGameState(world.getState());

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
  }, [isRunning, speed]); // speed 의존성 추가

  const togglePause = () => {
    setIsRunning(!isRunning);
  };

  const changeSpeed = (newSpeed: number) => {
    setSpeed(newSpeed);
  };

  return (
    <div className="App">
      <CanvasLayer worldState={gameState} bubbleFilters={bubbleFilters} />
      <TabManager gameState={gameState} />
      
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