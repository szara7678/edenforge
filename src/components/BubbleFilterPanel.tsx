import React, { useState } from 'react';
import { WorldState } from '../types';

interface BubbleFilterPanelProps {
  worldState: WorldState;
  onFilterChange: (filters: BubbleFilters) => void;
}

export interface BubbleFilters {
  showEntityBubbles: boolean;
  showFactionBubbles: boolean;
  showMaterialBubbles: boolean;
  showAnimalBubbles: boolean;
  showPlantBubbles: boolean;
  showEmotions: boolean;
  showActions: boolean;
  showThoughts: boolean;
  showSpeech: boolean;
  selectedEntities: string[];
  selectedFactions: string[];
  selectedCategories: string[];
}

export const BubbleFilterPanel: React.FC<BubbleFilterPanelProps> = ({
  worldState,
  onFilterChange
}) => {
  const [filters, setFilters] = useState<BubbleFilters>({
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

  const [tempFilters, setTempFilters] = useState<BubbleFilters>(filters);
  const [entitySearch, setEntitySearch] = useState('');
  const [factionSearch, setFactionSearch] = useState('');

  const handleFilterChange = (key: keyof BubbleFilters, value: any) => {
    const newFilters = { ...tempFilters, [key]: value };
    setTempFilters(newFilters);
  };

  const toggleEntity = (entityId: string) => {
    const newSelectedEntities = tempFilters.selectedEntities.includes(entityId)
      ? tempFilters.selectedEntities.filter(id => id !== entityId)
      : [...tempFilters.selectedEntities, entityId];
    handleFilterChange('selectedEntities', newSelectedEntities);
  };

  const toggleFaction = (factionId: string) => {
    const newSelectedFactions = tempFilters.selectedFactions.includes(factionId)
      ? tempFilters.selectedFactions.filter(id => id !== factionId)
      : [...tempFilters.selectedFactions, factionId];
    handleFilterChange('selectedFactions', newSelectedFactions);
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    onFilterChange(tempFilters);
  };

  const resetFilters = () => {
    const resetFilters: BubbleFilters = {
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
    };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
      {/* 말풍선 타입 필터 */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ marginBottom: '8px', color: '#4ecdc4', fontWeight: 'bold' }}>말풍선 타입</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={tempFilters.showEmotions}
              onChange={(e) => handleFilterChange('showEmotions', e.target.checked)}
              style={{ margin: 0 }}
            />
            감정 💭
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={tempFilters.showActions}
              onChange={(e) => handleFilterChange('showActions', e.target.checked)}
              style={{ margin: 0 }}
            />
            행동 ⚔️
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={tempFilters.showThoughts}
              onChange={(e) => handleFilterChange('showThoughts', e.target.checked)}
              style={{ margin: 0 }}
            />
            생각 💭
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={tempFilters.showSpeech}
              onChange={(e) => handleFilterChange('showSpeech', e.target.checked)}
              style={{ margin: 0 }}
            />
            대화 💬
          </label>
        </div>
      </div>

      {/* 엔티티 타입 필터 */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ marginBottom: '8px', color: '#4ecdc4', fontWeight: 'bold' }}>엔티티 타입</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={tempFilters.showEntityBubbles}
              onChange={(e) => handleFilterChange('showEntityBubbles', e.target.checked)}
              style={{ margin: 0 }}
            />
            인간 👤
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={tempFilters.showAnimalBubbles}
              onChange={(e) => handleFilterChange('showAnimalBubbles', e.target.checked)}
              style={{ margin: 0 }}
            />
            동물 🐺
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={tempFilters.showPlantBubbles}
              onChange={(e) => handleFilterChange('showPlantBubbles', e.target.checked)}
              style={{ margin: 0 }}
            />
            식물 🌿
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={tempFilters.showFactionBubbles}
              onChange={(e) => handleFilterChange('showFactionBubbles', e.target.checked)}
              style={{ margin: 0 }}
            />
            파벌 ⚔️
          </label>
        </div>
      </div>

      {/* 선택된 엔티티 */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ marginBottom: '8px', color: '#4ecdc4', fontWeight: 'bold' }}>
          선택된 엔티티 ({tempFilters.selectedEntities.length})
        </div>
        
        {/* 엔티티 검색 */}
        <div style={{ marginBottom: '8px' }}>
          <input
            type="text"
            placeholder="엔티티 검색..."
            value={entitySearch}
            onChange={(e) => setEntitySearch(e.target.value)}
            style={{
              width: '100%',
              padding: '4px 6px',
              backgroundColor: '#2a2a2a',
              border: '1px solid #4ecdc4',
              borderRadius: '3px',
              color: 'white',
              fontSize: '10px',
              outline: 'none'
            }}
          />
        </div>
        
        <div style={{ 
          maxHeight: '80px', 
          overflowY: 'auto',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          padding: '5px',
          borderRadius: '3px'
        }}>
          {worldState.entities
            .filter(entity => 
              entity.name.toLowerCase().includes(entitySearch.toLowerCase()) ||
              entity.species.toLowerCase().includes(entitySearch.toLowerCase())
            )
            .slice(0, 10)
            .map(entity => (
            <div key={entity.id} style={{ marginBottom: '2px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px' }}>
                <input
                  type="checkbox"
                  checked={tempFilters.selectedEntities.includes(entity.id)}
                  onChange={() => toggleEntity(entity.id)}
                  style={{ margin: 0 }}
                />
                {entity.name} ({entity.species})
              </label>
            </div>
          ))}
          {worldState.entities.length > 10 && (
            <div style={{ fontSize: '9px', opacity: 0.7, fontStyle: 'italic' }}>
              ... 외 {worldState.entities.length - 10}개
            </div>
          )}
        </div>
      </div>

      {/* 선택된 파벌 */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ marginBottom: '8px', color: '#4ecdc4', fontWeight: 'bold' }}>
          선택된 파벌 ({tempFilters.selectedFactions.length})
        </div>
        
        {/* 파벌 검색 */}
        <div style={{ marginBottom: '8px' }}>
          <input
            type="text"
            placeholder="파벌 검색..."
            value={factionSearch}
            onChange={(e) => setFactionSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '4px 6px',
              backgroundColor: '#2a2a2a',
              border: '1px solid #4ecdc4',
              borderRadius: '3px',
              color: 'white',
              fontSize: '10px',
              outline: 'none'
            }}
          />
        </div>
        
        <div style={{ 
          maxHeight: '60px', 
          overflowY: 'auto',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          padding: '5px',
          borderRadius: '3px'
        }}>
          {worldState.factions
            .filter(faction => 
              faction.name.toLowerCase().includes(factionSearch.toLowerCase())
            )
            .slice(0, 5)
            .map(faction => (
            <div key={faction.id} style={{ marginBottom: '2px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px' }}>
                <input
                  type="checkbox"
                  checked={tempFilters.selectedFactions.includes(faction.id)}
                  onChange={() => toggleFaction(faction.id)}
                  style={{ margin: 0 }}
                />
                {faction.name} ({faction.members.length}명)
              </label>
            </div>
          ))}
          {worldState.factions.length > 5 && (
            <div style={{ fontSize: '9px', opacity: 0.7, fontStyle: 'italic' }}>
              ... 외 {worldState.factions.length - 5}개
            </div>
          )}
        </div>
      </div>

      {/* 버튼들 */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        justifyContent: 'center',
        marginTop: '15px'
      }}>
        <button
          onClick={applyFilters}
          style={{
            backgroundColor: '#4ecdc4',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 'bold'
          }}
        >
          적용
        </button>
        
        <button
          onClick={resetFilters}
          style={{
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          초기화
        </button>
      </div>
    </div>
  );
}; 