# UI 시스템 (UI System)

## 📁 파일 위치
- **메인 앱**: `src/App.tsx`
- **맵 렌더링**: `src/components/CanvasLayer.tsx`
- **통합 패널**: `src/components/UnifiedPanel.tsx`
- **로그 패널**: `src/components/LogPanel.tsx`
- **통계 패널**: `src/components/StatsPanel.tsx`
- **차트 패널**: `src/components/ChartsPanel.tsx`
- **스타일**: `src/styles/`

## 🎨 메인 앱 구조

### 1. 앱 컴포넌트
**파일**: `src/App.tsx`

```typescript
function App() {
  const [world] = useState(() => new World());
  const [worldState, setWorldState] = useState<WorldState>(world.getState());
  
  // 게임 루프
  useEffect(() => {
    const interval = setInterval(() => {
      world.tick();
      setWorldState(world.getState());
    }, 100);
    
    return () => clearInterval(interval);
  }, [world]);
  
  return (
    <div className="App">
      <CanvasLayer worldState={worldState} />
      <UnifiedPanel 
        materials={worldState.materials}
        entities={worldState.entities}
        onMaterialSelect={handleMaterialSelect}
        onEntitySelect={handleEntitySelect}
      />
      <LogPanel logs={worldState.logs} onClearLogs={handleClearLogs} />
      <StatsPanel worldState={worldState} />
    </div>
  );
}
```

## 🗺️ 맵 렌더링 시스템

### 1. CanvasLayer 컴포넌트
**파일**: `src/components/CanvasLayer.tsx`

```typescript
const CanvasLayer: React.FC<CanvasLayerProps> = ({ worldState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewState, setViewState] = useState({
    offsetX: 0,
    offsetY: 0,
    scale: 1
  });
  const [clickedEntity, setClickedEntity] = useState<ClickedEntity | null>(null);
  
  // 렌더링 함수
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 뷰 변환 적용
    ctx.save();
    ctx.translate(viewState.offsetX, viewState.offsetY);
    ctx.scale(viewState.scale, viewState.scale);
    
    // 엔티티 렌더링
    renderEntities(ctx, worldState.entities);
    
    // 동물 렌더링
    renderAnimals(ctx, worldState.animals);
    
    // 식물 렌더링
    renderPlants(ctx, worldState.plants);
    
    // 클릭된 엔티티 툴팁 렌더링
    if (clickedEntity) {
      renderTooltip(ctx, clickedEntity);
    }
    
    ctx.restore();
  }, [worldState, viewState, clickedEntity]);
  
  useEffect(() => {
    render();
  }, [render]);
  
  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onClick={handleClick}
      style={{ border: '1px solid #ccc' }}
    />
  );
};
```

### 2. 엔티티 렌더링
```typescript
const renderEntities = (ctx: CanvasRenderingContext2D, entities: Entity[]) => {
  entities.forEach(entity => {
    if (entity.hp <= 0) return;
    
    const x = entity.pos.x;
    const y = entity.pos.y;
    
    // 엔티티 색상 (HP 기반)
    const hpRatio = entity.hp / 100;
    const color = hpRatio > 0.7 ? '#4CAF50' : hpRatio > 0.3 ? '#FF9800' : '#F44336';
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // 이름 표시
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(entity.name, x, y - 15);
  });
};
```

### 3. 클릭 처리
```typescript
const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
  if (isDragging) return;
  
  const canvas = canvasRef.current;
  if (!canvas) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left - viewState.offsetX) / viewState.scale;
  const y = (event.clientY - rect.top - viewState.offsetY) / viewState.scale;
  
  // 클릭된 엔티티 찾기
  const clicked = findClickedEntity(x, y);
  setClickedEntity(clicked);
};

const findClickedEntity = (x: number, y: number): ClickedEntity | null => {
  const clickRadius = 5;
  
  // 엔티티 검사
  for (const entity of worldState.entities) {
    const distance = Math.sqrt((x - entity.pos.x) ** 2 + (y - entity.pos.y) ** 2);
    if (distance <= clickRadius) {
      return { entity, type: 'entity' };
    }
  }
  
  // 동물 검사
  for (const animal of worldState.animals) {
    const distance = Math.sqrt((x - animal.pos.x) ** 2 + (y - animal.pos.y) ** 2);
    if (distance <= clickRadius) {
      return { entity: animal, type: 'animal' };
    }
  }
  
  // 식물 검사
  for (const plant of worldState.plants) {
    const distance = Math.sqrt((x - plant.pos.x) ** 2 + (y - plant.pos.y) ** 2);
    if (distance <= clickRadius) {
      return { entity: plant, type: 'plant' };
    }
  }
  
  return null;
};
```

## 📊 통계 패널 시스템

### 1. StatsPanel 컴포넌트
**파일**: `src/components/StatsPanel.tsx`

```typescript
const StatsPanel: React.FC<StatsPanelProps> = ({ worldState }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  const tabs: TabInfo[] = [
    { id: 'overview', label: '개요', icon: '📊' },
    { id: 'entities', label: '엔티티', icon: '👤' },
    { id: 'factions', label: '파벌', icon: '⚔️' },
    { id: 'ecosystem', label: '생태계', icon: '🌿' },
    { id: 'materials', label: '재료', icon: '🔧' },
    { id: 'charts', label: '차트', icon: '📈' }
  ];
  
  return (
    <div className="stats-panel">
      <div className="tab-header">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
      
      <div className="tab-content">
        {activeTab === 'overview' && <OverviewTab worldState={worldState} />}
        {activeTab === 'entities' && <EntitiesTab entities={worldState.entities} />}
        {activeTab === 'factions' && <FactionsTab factions={worldState.factions} />}
        {activeTab === 'ecosystem' && <EcosystemTab worldState={worldState} />}
        {activeTab === 'materials' && <MaterialsTab materials={worldState.materials} />}
        {activeTab === 'charts' && <ChartsPanel worldState={worldState} />}
      </div>
    </div>
  );
};
```

### 2. 차트 패널
**파일**: `src/components/ChartsPanel.tsx`

```typescript
const ChartsPanel: React.FC<ChartsPanelProps> = ({ worldState }) => {
  const [activeChart, setActiveChart] = useState<ChartType>('population');
  const [timeRange, setTimeRange] = useState<number>(100);
  
  const chartTypes: ChartTypeInfo[] = [
    { type: 'population', label: '인구 추이', icon: '👥' },
    { type: 'skills', label: '스킬 분포', icon: '⚔️' },
    { type: 'factions', label: '파벌 통계', icon: '🏰' },
    { type: 'deaths', label: '사망 이유', icon: '💀' }
  ];
  
  // 인구 추이 데이터
  const populationData = useMemo(() => {
    const timeSlots = Math.ceil(worldState.tick / timeRange);
    const data = [];
    
    for (let i = 0; i < timeSlots; i++) {
      const startTick = i * timeRange;
      const endTick = (i + 1) * timeRange;
      
      // 해당 시간대의 로그에서 엔티티 생성/사망 추적
      const logs = worldState.logs.filter(log => 
        log.timestamp >= startTick && log.timestamp < endTick
      );
      
      let population = 0;
      logs.forEach(log => {
        if (log.message.includes('탄생')) population++;
        if (log.message.includes('사망')) population--;
      });
      
      data.push({
        time: i,
        tick: endTick,
        population: Math.max(0, population)
      });
    }
    
    return data;
  }, [worldState.logs, worldState.tick, timeRange]);
  
  return (
    <div className="charts-panel">
      <div className="chart-controls">
        <div className="chart-type-selector">
          {chartTypes.map(chart => (
            <button
              key={chart.type}
              className={`chart-type-button ${activeChart === chart.type ? 'active' : ''}`}
              onClick={() => setActiveChart(chart.type)}
            >
              {chart.icon} {chart.label}
            </button>
          ))}
        </div>
        
        <select value={timeRange} onChange={(e) => setTimeRange(Number(e.target.value))}>
          <option value={50}>50 틱</option>
          <option value={100}>100 틱</option>
          <option value={200}>200 틱</option>
          <option value={500}>500 틱</option>
          <option value={1000}>1000 틱</option>
        </select>
      </div>
      
      <div className="chart-container">
        {renderChart(activeChart, worldState, timeRange)}
      </div>
    </div>
  );
};
```

## 📝 로그 패널 시스템

### 1. LogPanel 컴포넌트
**파일**: `src/components/LogPanel.tsx`

```typescript
const LogPanel: React.FC<LogPanelProps> = ({ logs, onClearLogs }) => {
  const [filterCategory, setFilterCategory] = useState<LogCategory | 'all'>('all');
  const [filterLevel, setFilterLevel] = useState<LogLevel | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
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
    { value: 'research', label: '연구', icon: '🔬' },
    { value: 'system', label: '시스템', icon: '⚙️' }
  ];
  
  return (
    <div className="log-panel">
      <div className="log-controls">
        <div className="filter-controls">
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as LogCategory | 'all')}>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
          
          <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value as LogLevel | 'all')}>
            <option value="all">전체 레벨</option>
            <option value="info">정보</option>
            <option value="warning">경고</option>
            <option value="error">오류</option>
            <option value="success">성공</option>
          </select>
        </div>
        
        <input
          type="text"
          placeholder="검색어 입력..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="log-content">
        {filteredLogs.slice(-100).reverse().map((log) => (
          <div key={log.id} className={`log-entry log-${log.level}`}>
            <div className="log-header">
              <span className="log-category">{getCategoryIcon(log.category)} {getCategoryName(log.category)}</span>
              <span className={`log-level log-${log.level}`}>{log.level.toUpperCase()}</span>
              <span className="log-time">{formatTime(log.timestamp)}</span>
            </div>
            <div className="log-message">{log.message}</div>
            {log.entityName && (
              <div className="log-entity">👤 {log.entityName}</div>
            )}
          </div>
        ))}
      </div>
      
      <div className="log-info">
        총 {logs.length}개 로그 중 {filteredLogs.length}개 표시
        {onClearLogs && (
          <button onClick={onClearLogs} className="clear-logs-button">
            로그 지우기
          </button>
        )}
      </div>
    </div>
  );
};
```

## 🔧 통합 패널 시스템

### 1. UnifiedPanel 컴포넌트
**파일**: `src/components/UnifiedPanel.tsx`

```typescript
const UnifiedPanel: React.FC<UnifiedPanelProps> = ({ 
  materials, 
  entities, 
  onMaterialSelect, 
  onEntitySelect 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('materials');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  
  // 검색 및 필터링된 재료
  const filteredMaterials = useMemo(() => {
    let filtered = materials.filter(material => 
      material.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterType !== 'all') {
      const tier = parseInt(filterType.replace('tier', ''));
      filtered = filtered.filter(material => material.tier === tier);
    }

    return filtered.sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
  }, [materials, searchTerm, filterType]);
  
  return (
    <div className="unified-panel">
      <div className="panel-header">
        <div className="tab-buttons">
          <button 
            className={`tab-button ${activeTab === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveTab('materials')}
          >
            🔧 재료
          </button>
          <button 
            className={`tab-button ${activeTab === 'entities' ? 'active' : ''}`}
            onClick={() => setActiveTab('entities')}
          >
            👤 엔티티
          </button>
        </div>
        
        <div className="search-filter">
          <input
            type="text"
            placeholder="검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select value={filterType} onChange={(e) => setFilterType(e.target.value as FilterType)}>
            <option value="all">전체</option>
            <option value="tier1">티어 1</option>
            <option value="tier2">티어 2</option>
            <option value="tier3">티어 3</option>
            <option value="tier4">티어 4</option>
            <option value="tier5">티어 5</option>
          </select>
        </div>
      </div>
      
      <div className="panel-content">
        {activeTab === 'materials' && (
          <div className="materials-list">
            {filteredMaterials.map(material => (
              <div 
                key={material.id} 
                className="material-item"
                onClick={() => onMaterialSelect?.(material)}
              >
                <div className="material-name">{material.name}</div>
                <div className="material-tier">티어 {material.tier}</div>
                <div className="material-props">
                  {Object.entries(material.props).map(([key, value]) => (
                    <span key={key} className="material-prop">
                      {key}: {value.toFixed(2)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'entities' && (
          <div className="entities-list">
            {filteredEntities.map(entity => (
              <div 
                key={entity.id} 
                className="entity-item"
                onClick={() => onEntitySelect?.(entity)}
              >
                <div className="entity-name">{entity.name}</div>
                <div className="entity-species">{entity.species}</div>
                <div className="entity-stats">
                  HP: {entity.hp.toFixed(1)} | 
                  스태미나: {entity.stamina.toFixed(1)} | 
                  배고픔: {entity.hunger.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
```

## 🎨 스타일 시스템

### 1. CSS 구조
**파일**: `src/styles/App.css`

```css
/* 패널 공통 스타일 */
.panel {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #444;
  border-radius: 8px;
  color: white;
  font-family: 'Arial', sans-serif;
}

/* 탭 시스템 */
.tab-header {
  display: flex;
  border-bottom: 1px solid #444;
}

.tab-button {
  background: none;
  border: none;
  color: #ccc;
  padding: 10px 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-button.active {
  background: #333;
  color: white;
  border-bottom: 2px solid #4CAF50;
}

/* 로그 시스템 */
.log-entry {
  padding: 8px;
  margin: 2px 0;
  border-radius: 4px;
  border-left: 3px solid;
}

.log-info { border-left-color: #4ecdc4; }
.log-warning { border-left-color: #ffd93d; }
.log-error { border-left-color: #ff6b6b; }
.log-success { border-left-color: #6bcf7f; }

/* 차트 시스템 */
.chart-container {
  height: 300px;
  padding: 20px;
}

.chart-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #444;
}
```

## 🚀 확장 포인트

### 새로운 탭 추가:
1. `TabType`에 새 탭 타입 추가
2. 해당 탭 컴포넌트 생성
3. `UnifiedPanel`에 탭 버튼과 내용 추가

### 새로운 차트 추가:
1. `ChartType`에 새 차트 타입 추가
2. `ChartsPanel`에 차트 렌더링 로직 추가
3. 데이터 처리 함수 구현

### 새로운 필터 추가:
1. 필터 상태 추가
2. 필터링 로직 구현
3. UI 컨트롤 추가 