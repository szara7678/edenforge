import { useState, useMemo } from 'react';
import { Material, Entity } from '../types';
import { DetailModal } from './DetailModal';

interface UnifiedPanelProps {
  materials: Material[];
  entities: Entity[];
  onMaterialSelect?: (material: Material) => void;
  onEntitySelect?: (entity: Entity) => void;
}

type TabType = 'materials' | 'entities';
type FilterType = 'all' | 'tier1' | 'tier2' | 'tier3' | 'tier4' | 'tier5';

const UnifiedPanel: React.FC<UnifiedPanelProps> = ({ 
  materials, 
  entities, 
  onMaterialSelect, 
  onEntitySelect 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('materials');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | undefined>();
  const [selectedEntity, setSelectedEntity] = useState<Entity | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // 검색 및 필터링된 엔티티
  const filteredEntities = useMemo(() => {
    let filtered = entities.filter(entity => 
      entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.species.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterType !== 'all') {
      const tier = parseInt(filterType.replace('tier', ''));
      // 엔티티의 경우 스킬 평균을 티어로 사용
      filtered = filtered.filter(entity => {
        const avgSkill = Object.values(entity.skills).reduce((sum: number, skill: number) => sum + skill, 0) / 8;
        const entityTier = Math.floor(avgSkill / 20) + 1;
        return entityTier === tier;
      });
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [entities, searchTerm, filterType]);

  const getTierColor = (tier: number): string => {
    switch (tier) {
      case 1: return '#6bcf7f';
      case 2: return '#4ecdc4';
      case 3: return '#45b7d1';
      case 4: return '#ffd93d';
      case 5: return '#ff8c00';
      default: return '#ff6b6b';
    }
  };

  const getSpeciesIcon = (species: string): string => {
    switch (species) {
      case 'human': return '👤';
      case 'wolf': return '🐺';
      case 'deer': return '🦌';
      case 'rabbit': return '🐰';
      case 'bear': return '🐻';
      case 'fox': return '🦊';
      default: return '❓';
    }
  };

  const formatProps = (props: Record<string, number>): string => {
    return Object.entries(props)
      .map(([key, value]) => `${key}: ${(value * 100).toFixed(0)}%`)
      .join(', ');
  };

  const getEntityTier = (entity: Entity): number => {
    const avgSkill = Object.values(entity.skills).reduce((sum, skill) => sum + skill, 0) / 8;
    return Math.floor(avgSkill / 20) + 1;
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      color: 'white',
      borderRadius: '8px',
      fontFamily: 'Noto Sans KR, sans-serif',
      fontSize: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid #333'
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '15px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>📚 데이터베이스</h3>
        <span style={{ fontSize: '12px', opacity: 0.7 }}>
          {activeTab === 'materials' ? `${materials.length}개 재료` : `${entities.length}개 엔티티`}
        </span>
      </div>

      {/* 탭 버튼 */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #333'
      }}>
        <button
          onClick={() => setActiveTab('materials')}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: activeTab === 'materials' ? '#4ecdc4' : 'transparent',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          🔬 재료 ({materials.length})
        </button>
        <button
          onClick={() => setActiveTab('entities')}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: activeTab === 'entities' ? '#4ecdc4' : 'transparent',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          👥 엔티티 ({entities.length})
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div style={{
        padding: '10px',
        borderBottom: '1px solid #333',
        display: 'flex',
        gap: '5px'
      }}>
        <input
          type="text"
          placeholder={activeTab === 'materials' ? "재료 검색..." : "엔티티 검색..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '5px',
            backgroundColor: '#333',
            color: 'white',
            border: '1px solid #555',
            borderRadius: '3px',
            fontSize: '11px'
          }}
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as FilterType)}
          style={{
            padding: '5px',
            backgroundColor: '#333',
            color: 'white',
            border: '1px solid #555',
            borderRadius: '3px',
            fontSize: '11px'
          }}
        >
          <option value="all">전체</option>
          <option value="tier1">티어 1</option>
          <option value="tier2">티어 2</option>
          <option value="tier3">티어 3</option>
          <option value="tier4">티어 4</option>
          <option value="tier5">티어 5</option>
        </select>
      </div>

      {/* 콘텐츠 영역 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '10px'
      }}>
        {activeTab === 'materials' ? (
          // 재료 탭
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredMaterials.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '20px',
                opacity: 0.5,
                fontStyle: 'italic'
              }}>
                검색 결과가 없습니다.
              </div>
            ) : (
              filteredMaterials.map((material) => (
                <div 
                  key={material.id}
                  onClick={() => {
                    setSelectedMaterial(material);
                    setSelectedEntity(undefined);
                    setIsModalOpen(true);
                    onMaterialSelect?.(material);
                  }}
                  style={{
                    padding: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '5px',
                    border: `2px solid ${getTierColor(material.tier)}`,
                    cursor: onMaterialSelect ? 'pointer' : 'default',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '5px'
                  }}>
                    <span style={{ 
                      fontWeight: 'bold', 
                      fontSize: '14px',
                      color: getTierColor(material.tier)
                    }}>
                      {material.name}
                    </span>
                    <span style={{ 
                      fontSize: '10px', 
                      opacity: 0.7,
                      backgroundColor: getTierColor(material.tier),
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '10px'
                    }}>
                      티어 {material.tier}
                    </span>
                  </div>
                  
                  <div style={{ 
                    fontSize: '10px', 
                    opacity: 0.8,
                    marginBottom: '5px'
                  }}>
                    {formatProps(material.props)}
                  </div>
                  
                  {material.parents && (
                    <div style={{ 
                      fontSize: '9px', 
                      opacity: 0.6,
                      fontStyle: 'italic'
                    }}>
                      부모: {material.parents.join(' + ')}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          // 엔티티 탭
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredEntities.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '20px',
                opacity: 0.5,
                fontStyle: 'italic'
              }}>
                검색 결과가 없습니다.
              </div>
            ) : (
              filteredEntities.map((entity) => {
                const entityTier = getEntityTier(entity);
                const avgSkill = Object.values(entity.skills).reduce((sum, skill) => sum + skill, 0) / 8;
                
                return (
                  <div 
                    key={entity.id}
                    onClick={() => {
                      setSelectedEntity(entity);
                      setSelectedMaterial(undefined);
                      setIsModalOpen(true);
                      onEntitySelect?.(entity);
                    }}
                    style={{
                      padding: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '5px',
                      border: `2px solid ${getTierColor(entityTier)}`,
                      cursor: onEntitySelect ? 'pointer' : 'default',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '5px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>{getSpeciesIcon(entity.species)}</span>
                        <span style={{ 
                          fontWeight: 'bold', 
                          fontSize: '14px',
                          color: getTierColor(entityTier)
                        }}>
                          {entity.name}
                        </span>
                      </div>
                      <span style={{ 
                        fontSize: '10px', 
                        opacity: 0.7,
                        backgroundColor: getTierColor(entityTier),
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '10px'
                      }}>
                        티어 {entityTier}
                      </span>
                    </div>
                    
                    <div style={{ 
                      fontSize: '10px', 
                      opacity: 0.8,
                      marginBottom: '5px'
                    }}>
                      {entity.species} • HP: {entity.hp.toFixed(0)} • 스태미나: {entity.stamina.toFixed(0)}
                    </div>
                    
                    <div style={{ 
                      fontSize: '9px', 
                      opacity: 0.6
                    }}>
                      평균 스킬: {avgSkill.toFixed(1)} • 나이: {entity.age.toFixed(1)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      
      {/* 상세 정보 모달 */}
      <DetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMaterial(undefined);
          setSelectedEntity(undefined);
        }}
        data={selectedMaterial || selectedEntity || null}
        type={selectedMaterial ? 'material' : selectedEntity ? 'entity' : null}
      />
    </div>
  );
};

export default UnifiedPanel; 