import { useRef, useEffect, useState } from 'react';
import { WorldState, Entity, Animal, Plant } from '../types';
import { BubbleFilters } from './BubbleFilterPanel';

interface CanvasLayerProps {
  worldState: WorldState;
  bubbleFilters?: BubbleFilters;
}

interface MapView {
  x: number;
  y: number;
  scale: number;
}

interface ClickedEntity {
  entity: Entity | Animal | Plant;
  type: 'entity' | 'animal' | 'plant';
  position: { x: number; y: number };
}

const CanvasLayer: React.FC<CanvasLayerProps> = ({ worldState, bubbleFilters }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapView, setMapView] = useState<MapView>({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [clickedEntity, setClickedEntity] = useState<ClickedEntity | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정 (패딩 포함)
    const padding = 10;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - padding * 2;

    // 배경 지우기
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 맵 경계 그리기
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.strokeRect(padding, padding, canvas.width - padding * 2, canvas.height - padding * 2);

    // 좌표 변환 적용
    ctx.save();
    ctx.translate(mapView.x, mapView.y);
    ctx.scale(mapView.scale, mapView.scale);

    // 엔티티 렌더링
    ctx.font = '12px Noto Sans KR';
    ctx.textAlign = 'center';

    for (const entity of worldState.entities) {
      // 파벌 색상 우선 적용
      let color = '#ffffff';
      if (entity.factionId) {
        const faction = worldState.factions.find(f => f.id === entity.factionId);
        if (faction) {
          color = faction.color;
        } else {
          // 파벌이 없으면 종족별 색상
          switch (entity.species) {
            case 'human':
              color = '#ff6b6b';
              break;
            case 'wolf':
              color = '#4ecdc4';
              break;
            case 'deer':
              color = '#45b7d1';
              break;
            case 'rabbit':
              color = '#96ceb4';
              break;
            case 'bear':
              color = '#8b4513';
              break;
            case 'fox':
              color = '#ff8c00';
              break;
          }
        }
      } else {
        // 파벌이 없으면 종족별 색상
        switch (entity.species) {
          case 'human':
            color = '#ff6b6b';
            break;
          case 'wolf':
            color = '#4ecdc4';
            break;
          case 'deer':
            color = '#45b7d1';
            break;
          case 'rabbit':
            color = '#96ceb4';
            break;
          case 'bear':
            color = '#8b4513';
            break;
          case 'fox':
            color = '#ff8c00';
            break;
        }
      }

      // 엔티티 그리기
      ctx.fillStyle = color;
      ctx.fillRect(entity.pos.x, entity.pos.y, 4, 4);

      // HP 상태 표시
      if (entity.hp < 50) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(entity.pos.x - 2, entity.pos.y - 8, 8, 2);
      }

      // 파벌 리더 표시
      if (entity.factionId) {
        const faction = worldState.factions.find(f => f.id === entity.factionId);
        if (faction?.leader?.id === entity.id) {
          ctx.fillStyle = '#ffff00';
          ctx.fillRect(entity.pos.x - 1, entity.pos.y - 1, 6, 6);
        }
      }
    }

    // 재료 표시 (간단한 점들)
    ctx.fillStyle = '#8b4513';
    for (let i = 0; i < 100; i++) {
      const x = (i * 37) % 1000;
      const y = (i * 73) % 1000;
      ctx.fillRect(x, y, 2, 2);
    }

    // 식물 렌더링
    for (const plant of worldState.plants) {
      if (plant.isDead) continue;
      
      let color = '#228B22'; // 기본 녹색
      let size = 3;
      
      switch (plant.species) {
        case 'tree':
          color = '#006400';
          size = 6;
          break;
        case 'grass':
          color = '#90EE90';
          size = 2;
          break;
        case 'bush':
          color = '#228B22';
          size = 4;
          break;
        case 'flower':
          color = '#FF69B4';
          size = 3;
          break;
        case 'mushroom':
          color = '#8B4513';
          size = 3;
          break;
      }

      ctx.fillStyle = color;
      ctx.fillRect(plant.pos.x, plant.pos.y, size, size);

      // 성숙한 식물 표시
      if (plant.isMature) {
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(plant.pos.x - 1, plant.pos.y - 1, size + 2, size + 2);
      }
    }

    // 동물 렌더링
    for (const animal of worldState.animals) {
      if (animal.hp <= 0) continue;
      
      let color = '#FF6B6B';
      let size = 4;
      
      switch (animal.species) {
        case 'wolf':
          color = '#4A4A4A';
          size = 5;
          break;
        case 'deer':
          color = '#8B4513';
          size = 4;
          break;
        case 'rabbit':
          color = '#F5F5DC';
          size = 3;
          break;
        case 'bear':
          color = '#654321';
          size = 6;
          break;
        case 'fox':
          color = '#FF8C00';
          size = 4;
          break;
      }

      ctx.fillStyle = color;
      ctx.fillRect(animal.pos.x, animal.pos.y, size, size);

      // 공포 상태 표시
      if (animal.fear > 0.5) {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(animal.pos.x - 1, animal.pos.y - 1, size + 2, size + 2);
      }
    }



    // 감정 말풍선 렌더링 (필터링 적용)
    if (worldState.emotionBubbles.length > 0 && bubbleFilters) {
      const filteredBubbles = worldState.emotionBubbles.filter(bubble => {
        const entity = worldState.entities.find(e => e.id === bubble.entityId);
        if (!entity) return false;

        // 엔티티 타입 필터링
        if (entity.species === 'human' && !bubbleFilters.showEntityBubbles) return false;
        if (entity.species !== 'human' && !bubbleFilters.showAnimalBubbles) return false;

        // 말풍선 타입 필터링
        if (bubble.type === 'emotion' && !bubbleFilters.showEmotions) return false;
        if (bubble.type === 'action' && !bubbleFilters.showActions) return false;
        if (bubble.type === 'thought' && !bubbleFilters.showThoughts) return false;
        if (bubble.type === 'speech' && !bubbleFilters.showSpeech) return false;

        // 선택된 엔티티 필터링
        if (bubbleFilters.selectedEntities.length > 0 && 
            !bubbleFilters.selectedEntities.includes(entity.id)) return false;

        // 선택된 파벌 필터링
        if (bubbleFilters.selectedFactions.length > 0 && entity.factionId &&
            !bubbleFilters.selectedFactions.includes(entity.factionId)) return false;

        return true;
      });

      for (const bubble of filteredBubbles.slice(-8)) { // 최대 8개만 렌더링
        const entity = worldState.entities.find(e => e.id === bubble.entityId);
        if (!entity) continue;

        const age = bubble.age / bubble.duration;
        const alpha = 1 - age;
        const scale = 1 + age * 0.3; // 스케일 효과 줄임
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `${14 * scale}px 'Noto Sans KR', sans-serif`; // 폰트 크기 줄임
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        
        // 말풍선 배경 (단순화)
        const textWidth = ctx.measureText(bubble.message).width;
        const bubbleWidth = Math.max(textWidth + 16, 60);
        const bubbleHeight = 24;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = 1;
        ctx.roundRect(
          entity.pos.x - bubbleWidth / 2,
          entity.pos.y - 35 - bubbleHeight,
          bubbleWidth,
          bubbleHeight,
          6
        );
        ctx.fill();
        ctx.stroke();
        
        // 이모지와 텍스트
        ctx.fillStyle = 'white';
        ctx.fillText(bubble.emoji, entity.pos.x, entity.pos.y - 40);
        ctx.fillText(bubble.message, entity.pos.x, entity.pos.y - 22);
        
        ctx.restore();
      }
    }

    // 좌표 변환 복원
    ctx.restore();

    // 클릭된 엔티티 말풍선 렌더링
    if (clickedEntity) {
      const { entity, type, position } = clickedEntity;
      
      // 말풍선 배경
      const bubbleWidth = 200;
      const bubbleHeight = 80;
      const bubbleX = position.x - bubbleWidth / 2;
      const bubbleY = position.y - bubbleHeight - 20;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.strokeStyle = '#4ecdc4';
      ctx.lineWidth = 2;
      ctx.fillRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight);
      ctx.strokeRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight);
      
      // 텍스트 렌더링
      ctx.fillStyle = 'white';
      ctx.font = '12px Noto Sans KR';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      
      let title = '';
      let info = '';
      
      if (type === 'entity') {
        const e = entity as Entity;
        title = `${e.name} (${e.species})`;
        info = `HP: ${e.hp}/100 | 나이: ${e.age} | 파벌: ${e.factionId || '없음'}`;
      } else if (type === 'animal') {
        const a = entity as Animal;
        title = `${a.name} (${a.species})`;
        info = `HP: ${a.hp}/100 | 공포: ${(a.fear * 100).toFixed(0)}% | 크기: ${(a.size * 100).toFixed(0)}%`;
      } else if (type === 'plant') {
        const p = entity as Plant;
        title = `${p.name} (${p.species})`;
        info = `성장: ${(p.growth * 100).toFixed(0)}% | HP: ${p.hp}/${p.maxHp} | 성숙: ${p.isMature ? '예' : '아니오'}`;
      }
      
      ctx.fillText(title, bubbleX + 10, bubbleY + 10);
      ctx.fillText(info, bubbleX + 10, bubbleY + 30);
    }

  }, [worldState, mapView, clickedEntity]);

  // 마우스 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - mapView.x, y: e.clientY - mapView.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setMapView(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 클릭 이벤트 핸들러
  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return; // 드래그 중이면 클릭 무시

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - mapView.x) / mapView.scale;
    const y = (e.clientY - rect.top - mapView.y) / mapView.scale;

    // 클릭 범위 (5픽셀 반경)
    const clickRadius = 5;

    // 엔티티 검사
    for (const entity of worldState.entities) {
      const distance = Math.sqrt((x - entity.pos.x) ** 2 + (y - entity.pos.y) ** 2);
      if (distance <= clickRadius) {
        setClickedEntity({
          entity,
          type: 'entity',
          position: { x: e.clientX, y: e.clientY }
        });
        return;
      }
    }

    // 동물 검사
    for (const animal of worldState.animals) {
      if (animal.hp <= 0) continue;
      const distance = Math.sqrt((x - animal.pos.x) ** 2 + (y - animal.pos.y) ** 2);
      if (distance <= clickRadius) {
        setClickedEntity({
          entity: animal,
          type: 'animal',
          position: { x: e.clientX, y: e.clientY }
        });
        return;
      }
    }

    // 식물 검사
    for (const plant of worldState.plants) {
      if (plant.isDead) continue;
      const distance = Math.sqrt((x - plant.pos.x) ** 2 + (y - plant.pos.y) ** 2);
      if (distance <= clickRadius) {
        setClickedEntity({
          entity: plant,
          type: 'plant',
          position: { x: e.clientX, y: e.clientY }
        });
        return;
      }
    }

    // 아무것도 클릭하지 않았으면 말풍선 제거
    setClickedEntity(null);
  };



  // wheel 이벤트 리스너를 직접 추가하여 preventDefault 문제 해결
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheelDirect = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setMapView(prev => ({
        ...prev,
        scale: Math.max(0.5, Math.min(3, prev.scale * delta))
      }));
    };

    canvas.addEventListener('wheel', handleWheelDirect, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheelDirect);
    };
  }, []);

  const zoomIn = () => {
    setMapView(prev => ({
      ...prev,
      scale: Math.min(3, prev.scale * 1.2)
    }));
  };

  const zoomOut = () => {
    setMapView(prev => ({
      ...prev,
      scale: Math.max(0.5, prev.scale * 0.8)
    }));
  };

  const resetView = () => {
    setMapView({ x: 0, y: 0, scale: 1 });
  };

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      />
      
      {/* 맵 컨트롤 버튼 */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
      }}>
        <button
          onClick={zoomIn}
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            border: '1px solid #4ecdc4',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          +
        </button>
        <button
          onClick={zoomOut}
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            border: '1px solid #4ecdc4',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          -
        </button>
        <button
          onClick={resetView}
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            border: '1px solid #4ecdc4',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          ⌂
        </button>
      </div>
      
      {/* 맵 정보 */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <div>확대: {(mapView.scale * 100).toFixed(0)}%</div>
        <div>위치: ({mapView.x.toFixed(0)}, {mapView.y.toFixed(0)})</div>
      </div>
    </div>
  );
};

export default CanvasLayer; 