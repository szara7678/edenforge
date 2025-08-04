import { useEffect, useRef, useState } from 'react';
import { World } from './core/world';
import { WorldState, Entity, Animal, Plant, Material, Faction } from './types';
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
    console.log('App: 파라미터 초기화 시작');
    
    parameterManager.loadParameters();
    
    // 저장된 파라미터가 없으면 기본값 로드
    if (!localStorage.getItem('edenforge_parameters')) {
      console.log('App: 기본값 로드 및 저장');
      parameterManager.resetToDefaults();
      parameterManager.saveParameters(); // 기본값 저장
    }
    
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
      
      // 파라미터에서 초기 인간 수 가져오기
      const initialHumanCount = parameterManager.getParameter('world', 'initialHumanCount');
      console.log('새 게임 시작 - 초기 인간 수:', initialHumanCount);
      
      // 엔티티 생성
      newWorld.generatePrimitives(initialHumanCount);
      
      // 생성된 상태 가져오기
      const newGameState = newWorld.getState();
      console.log('새 게임 상태:', {
        entities: newGameState.entities.length,
        animals: newGameState.animals.length,
        plants: newGameState.plants.length
      });
      
      // 엔티티들의 초기 상태를 더 안전하게 설정
      newGameState.entities.forEach(entity => {
        // 초기 상태를 최대값으로 설정하여 첫 번째 tick에서 사망하지 않도록 함
        entity.hp = Math.max(entity.hp, 80);
        entity.stamina = Math.max(entity.stamina, 80);
        entity.hunger = Math.min(entity.hunger, 20);
        entity.age = Math.min(entity.age, 10);
      });
      
      setWorld(newWorld);
      setGameState(newGameState);
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

  // 데이터 편집 패널용 업데이트 함수들
  const handleEntityUpdate = (entity: Entity) => {
    const updatedEntities = gameState.entities.map(e => 
      e.id === entity.id ? entity : e
    );
    const newGameState = { ...gameState, entities: updatedEntities };
    world.loadState(newGameState);
    setGameState(newGameState);
    console.log('엔티티 업데이트됨:', entity.name);
  };

  const handleEntityCreate = (entity: Entity) => {
    const newGameState = { 
      ...gameState, 
      entities: [...gameState.entities, entity] 
    };
    world.loadState(newGameState);
    setGameState(newGameState);
    console.log('엔티티 생성됨:', entity.name);
  };

  const handleAnimalUpdate = (animal: Animal) => {
    const updatedAnimals = gameState.animals.map(a => 
      a.id === animal.id ? animal : a
    );
    const newGameState = { ...gameState, animals: updatedAnimals };
    world.loadState(newGameState);
    setGameState(newGameState);
    console.log('동물 업데이트됨:', animal.name);
  };

  const handleAnimalCreate = (animal: Animal) => {
    const newGameState = { 
      ...gameState, 
      animals: [...gameState.animals, animal] 
    };
    world.loadState(newGameState);
    setGameState(newGameState);
    console.log('동물 생성됨:', animal.name);
  };

  const handlePlantUpdate = (plant: Plant) => {
    const updatedPlants = gameState.plants.map(p => 
      p.id === plant.id ? plant : p
    );
    const newGameState = { ...gameState, plants: updatedPlants };
    world.loadState(newGameState);
    setGameState(newGameState);
    console.log('식물 업데이트됨:', plant.name);
  };

  const handlePlantCreate = (plant: Plant) => {
    const newGameState = { 
      ...gameState, 
      plants: [...gameState.plants, plant] 
    };
    world.loadState(newGameState);
    setGameState(newGameState);
    console.log('식물 생성됨:', plant.name);
  };

  const handleMaterialUpdate = (material: Material) => {
    const updatedMaterials = gameState.materials.map(m => 
      m.id === material.id ? material : m
    );
    const newGameState = { ...gameState, materials: updatedMaterials };
    world.loadState(newGameState);
    setGameState(newGameState);
    console.log('재료 업데이트됨:', material.name);
  };

  const handleMaterialCreate = (material: Material) => {
    const newGameState = { 
      ...gameState, 
      materials: [...gameState.materials, material] 
    };
    world.loadState(newGameState);
    setGameState(newGameState);
    console.log('재료 생성됨:', material.name);
  };

  const handleFactionUpdate = (faction: Faction) => {
    const updatedFactions = gameState.factions.map(f => 
      f.id === faction.id ? faction : f
    );
    const newGameState = { ...gameState, factions: updatedFactions };
    world.loadState(newGameState);
    setGameState(newGameState);
    console.log('파벌 업데이트됨:', faction.name);
  };

  const handleFactionCreate = (faction: Faction) => {
    const newGameState = { 
      ...gameState, 
      factions: [...gameState.factions, faction] 
    };
    world.loadState(newGameState);
    setGameState(newGameState);
    console.log('파벌 생성됨:', faction.name);
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
        onEntityUpdate={handleEntityUpdate}
        onEntityCreate={handleEntityCreate}
        onAnimalUpdate={handleAnimalUpdate}
        onAnimalCreate={handleAnimalCreate}
        onPlantUpdate={handlePlantUpdate}
        onPlantCreate={handlePlantCreate}
        onMaterialUpdate={handleMaterialUpdate}
        onMaterialCreate={handleMaterialCreate}
        onFactionUpdate={handleFactionUpdate}
        onFactionCreate={handleFactionCreate}
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