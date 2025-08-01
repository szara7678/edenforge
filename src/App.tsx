import { useEffect, useRef, useState } from 'react';
import { World } from './core/world';
import CanvasLayer from './components/CanvasLayer';
import HUD from './components/HUD.tsx';
import { TabManager } from './components/TabManager';
import './styles/App.css';

function App() {
  const [world] = useState(() => new World());
  const [gameState, setGameState] = useState(world.getState());
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(0.2); // 기본 속도를 0.2로 설정
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
      <CanvasLayer worldState={gameState} />
      <HUD 
        entityCount={gameState.entities.length}
        tick={gameState.tick}
        isRunning={isRunning}
        speed={speed}
        onTogglePause={togglePause}
        onChangeSpeed={changeSpeed}
      />
      <TabManager gameState={gameState} />
      
      {/* 디버그 정보 */}
      <div style={{
        position: 'absolute',
        top: 100,
        left: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <div>로그 수: {gameState.logs.length}</div>
        <div>재료 수: {gameState.materials.length}</div>
        <div>엔티티 수: {gameState.entities.length}</div>
        <div>파벌 수: {gameState.factions.length}</div>
        <div>동물 수: {gameState.animals.length}</div>
        <div>식물 수: {gameState.plants.length}</div>
      </div>
    </div>
  );
}

export default App; 