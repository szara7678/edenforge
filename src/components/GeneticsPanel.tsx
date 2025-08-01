import React, { useState, useMemo } from 'react';
import { Entity } from '../types';
import { GeneticTrait } from '../core/genetics';
import { LearningExperience, TeachingSession } from '../core/learning';

interface GeneticsPanelProps {
  entities: Entity[];
  geneticTraits: GeneticTrait[];
  onEntitySelect?: (entity: Entity) => void;
}

interface FamilyNode {
  entity: Entity;
  children: FamilyNode[];
  level: number;
}

export const GeneticsPanel: React.FC<GeneticsPanelProps> = ({ 
  entities, 
  geneticTraits,
  onEntitySelect 
}) => {
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [activeTab, setActiveTab] = useState<'family-tree' | 'ancestry-data' | 'traits'>('family-tree');

  const handleEntitySelect = (entity: Entity) => {
    setSelectedEntity(entity);
    onEntitySelect?.(entity);
  };

  const getTraitName = (traitId: string): string => {
    const trait = geneticTraits.find(t => t.id === traitId);
    return trait?.name || traitId;
  };

  const getTraitDescription = (traitId: string): string => {
    const trait = geneticTraits.find(t => t.id === traitId);
    return trait?.description || '설명 없음';
  };

  const getTraitEffect = (traitId: string): string => {
    const trait = geneticTraits.find(t => t.id === traitId);
    if (!trait) return '';
    
    const { effect } = trait;
    switch (effect.type) {
      case 'stat':
        return `${effect.target} +${effect.value}`;
      case 'skill':
        return `${effect.target} 스킬 +${effect.value}`;
      case 'gene':
        return `${effect.target} 유전자 +${effect.value}`;
      case 'epi':
        return `${effect.target} 후성유전 +${effect.value}`;
      default:
        return '';
    }
  };

  const getSkillName = (skillKey: string): string => {
    const skillNames: Record<string, string> = {
      gather: '수집',
      analyze: '분석',
      craft: '제작',
      build: '건축',
      cook: '요리',
      combat: '전투',
      trade: '거래',
      lead: '지도력'
    };
    return skillNames[skillKey] || skillKey;
  };

  // 가족 트리 렌더링
  const renderFamilyTree = (entity: Entity) => {
    const buildFamilyTree = (targetEntity: Entity, level: number = 0): FamilyNode => {
      const children = entities.filter(e => 
        e.parents && e.parents.includes(targetEntity.id)
      );
      
      return {
        entity: targetEntity,
        children: children.map(child => buildFamilyTree(child, level + 1)),
        level
      };
    };

    const familyTree = buildFamilyTree(entity);

    const renderNode = (node: FamilyNode) => (
      <div key={node.entity.id} className="family-node" style={{ marginLeft: `${node.level * 20}px` }}>
        <div className="node-content">
          <div className="node-name">{node.entity.name}</div>
          <div className="node-info">
            나이: {node.entity.age.toFixed(1)} | 
            HP: {node.entity.hp.toFixed(1)} | 
            특성: {node.entity.geneticTraits?.length || 0}개
          </div>
        </div>
        {node.children.length > 0 && (
          <div className="node-children">
            {node.children.map(child => renderNode(child))}
          </div>
        )}
      </div>
    );

    return (
      <div className="family-tree">
        <div className="tree-info">
          <p>가족 구성원: {countFamilyMembers(familyTree)}명</p>
          <p>세대 수: {getMaxGeneration(familyTree)}세대</p>
        </div>
        <div className="tree-nodes">
          {renderNode(familyTree)}
        </div>
      </div>
    );
  };

  // 선조 데이터 추이 렌더링
  const renderAncestryData = (entity: Entity) => {
    const getAncestors = (targetEntity: Entity): Entity[] => {
      const ancestors: Entity[] = [];
      const visited = new Set<string>();

      const traverse = (currentEntity: Entity) => {
        if (visited.has(currentEntity.id)) return;
        visited.add(currentEntity.id);

        if (currentEntity.parents && currentEntity.parents.length > 0) {
          const parents = entities.filter(e => currentEntity.parents!.includes(e.id));
          parents.forEach(parent => {
            ancestors.push(parent);
            traverse(parent);
          });
        }
      };

      traverse(targetEntity);
      return ancestors;
    };

    const ancestors = getAncestors(entity);
    const generations = groupByGeneration(ancestors);

    return (
      <div className="ancestry-data">
        <div className="ancestry-summary">
          <h5>선조 통계</h5>
          <div className="summary-grid">
            <div className="summary-item">
              <div className="summary-label">총 선조 수</div>
              <div className="summary-value">{ancestors.length}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">평균 나이</div>
              <div className="summary-value">
                {ancestors.length > 0 
                  ? (ancestors.reduce((sum, a) => sum + a.age, 0) / ancestors.length).toFixed(1)
                  : '0.0'
                }
              </div>
            </div>
            <div className="summary-item">
              <div className="summary-label">평균 지능</div>
              <div className="summary-value">
                {ancestors.length > 0 
                  ? (ancestors.reduce((sum, a) => sum + a.stats.int, 0) / ancestors.length).toFixed(1)
                  : '0.0'
                }
              </div>
            </div>
          </div>
        </div>

        <div className="generation-charts">
          <h5>세대별 특성 분포</h5>
          {Object.entries(generations).map(([gen, members]) => (
            <div key={gen} className="generation-chart">
              <h6>{gen}세대 ({members.length}명)</h6>
              <div className="chart-bars">
                <div className="chart-bar">
                  <div className="bar-label">평균 지능</div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{ 
                        width: `${(members.reduce((sum, m) => sum + m.stats.int, 0) / members.length)}%`,
                        backgroundColor: '#4ecdc4'
                      }}
                    ></div>
                  </div>
                  <div className="bar-value">
                    {(members.reduce((sum, m) => sum + m.stats.int, 0) / members.length).toFixed(1)}
                  </div>
                </div>
                <div className="chart-bar">
                  <div className="bar-label">평균 힘</div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{ 
                        width: `${(members.reduce((sum, m) => sum + m.stats.str, 0) / members.length)}%`,
                        backgroundColor: '#ff6b6b'
                      }}
                    ></div>
                  </div>
                  <div className="bar-value">
                    {(members.reduce((sum, m) => sum + m.stats.str, 0) / members.length).toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 가족 구성원 수 계산
  const countFamilyMembers = (node: FamilyNode): number => {
    return 1 + node.children.reduce((sum, child) => sum + countFamilyMembers(child), 0);
  };

  // 최대 세대 수 계산
  const getMaxGeneration = (node: FamilyNode): number => {
    if (node.children.length === 0) return 1;
    return 1 + Math.max(...node.children.map(child => getMaxGeneration(child)));
  };

  // 세대별 그룹화
  const groupByGeneration = (ancestors: Entity[]): Record<string, Entity[]> => {
    const generations: Record<string, Entity[]> = {};
    
    ancestors.forEach(ancestor => {
      const gen = Math.floor(ancestor.age / 20) + 1; // 나이를 기반으로 세대 계산
      const genKey = `${gen}세대`;
      if (!generations[genKey]) {
        generations[genKey] = [];
      }
      generations[genKey].push(ancestor);
    });

    return generations;
  };

  return (
    <div className="genetics-panel">
      <div className="genetics-header">
        <h3>유전 & 학습</h3>
        <div className="entity-count">
          총 {entities.length}개 엔티티
        </div>
      </div>

      <div className="genetics-content">
        <div className="entity-list">
          <h4>엔티티 목록</h4>
          {entities.map(entity => (
            <div 
              key={entity.id}
              className={`entity-item ${selectedEntity?.id === entity.id ? 'selected' : ''}`}
              onClick={() => handleEntitySelect(entity)}
            >
              <div className="entity-info">
                <div className="entity-name">{entity.name}</div>
                <div className="entity-stats">
                  나이: {Math.floor(entity.age)} | 
                  HP: {Math.floor(entity.hp)} | 
                  지능: {entity.stats.int}
                </div>
              </div>
              <div className="entity-traits">
                {entity.geneticTraits?.length || 0}개 특성
              </div>
            </div>
          ))}
        </div>

        {selectedEntity && (
          <div className="entity-details">
            <div className="entity-tabs">
              <button 
                className={activeTab === 'family-tree' ? 'active' : ''}
                onClick={() => setActiveTab('family-tree')}
              >
                가족 트리
              </button>
              <button 
                className={activeTab === 'ancestry-data' ? 'active' : ''}
                onClick={() => setActiveTab('ancestry-data')}
              >
                선조 데이터
              </button>
              <button 
                className={activeTab === 'traits' ? 'active' : ''}
                onClick={() => setActiveTab('traits')}
              >
                유전 특성
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'family-tree' && (
                <div className="family-tree-tab">
                  <h4>{selectedEntity.name}의 가족 트리</h4>
                  <div className="family-tree-container">
                    {renderFamilyTree(selectedEntity)}
                  </div>
                </div>
              )}

              {activeTab === 'ancestry-data' && (
                <div className="ancestry-data-tab">
                  <h4>{selectedEntity.name}의 선조 데이터 추이</h4>
                  <div className="ancestry-charts">
                    {renderAncestryData(selectedEntity)}
                  </div>
                </div>
              )}

              {activeTab === 'traits' && (
                <div className="traits-tab">
                  <div className="entity-header-info">
                    <h4>{selectedEntity.name}</h4>
                    <div className="entity-genes">
                      <div>생존: {selectedEntity.genes.survival.toFixed(2)}</div>
                      <div>번식: {selectedEntity.genes.reproduction.toFixed(2)}</div>
                      <div>호기심: {selectedEntity.genes.curiosity.toFixed(2)}</div>
                      <div>사회성: {selectedEntity.genes.social.toFixed(2)}</div>
                      <div>명예: {selectedEntity.genes.prestige.toFixed(2)}</div>
                      <div>피로: {selectedEntity.genes.fatigue.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="genetic-traits">
                    <h5>유전 특성 ({selectedEntity.geneticTraits?.length || 0}개)</h5>
                    {selectedEntity.geneticTraits && selectedEntity.geneticTraits.length > 0 ? (
                      <div className="trait-list">
                        {selectedEntity.geneticTraits.map(traitId => (
                          <div key={traitId} className="trait-item">
                            <div className="trait-name">{getTraitName(traitId)}</div>
                            <div className="trait-description">{getTraitDescription(traitId)}</div>
                            <div className="trait-effect">{getTraitEffect(traitId)}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-traits">유전 특성이 없습니다.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 