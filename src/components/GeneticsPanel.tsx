import React, { useState } from 'react';
import { Entity } from '../types';
import { GeneticTrait } from '../core/genetics';
import { LearningExperience, TeachingSession } from '../core/learning';

interface GeneticsPanelProps {
  entities: Entity[];
  geneticTraits: GeneticTrait[];
  onEntitySelect?: (entity: Entity) => void;
}

export const GeneticsPanel: React.FC<GeneticsPanelProps> = ({ 
  entities, 
  geneticTraits,
  onEntitySelect 
}) => {
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [activeTab, setActiveTab] = useState<'traits' | 'learning' | 'teaching' | 'stats'>('traits');

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
                className={activeTab === 'traits' ? 'active' : ''}
                onClick={() => setActiveTab('traits')}
              >
                유전 특성
              </button>
              <button 
                className={activeTab === 'learning' ? 'active' : ''}
                onClick={() => setActiveTab('learning')}
              >
                학습 경험
              </button>
              <button 
                className={activeTab === 'teaching' ? 'active' : ''}
                onClick={() => setActiveTab('teaching')}
              >
                가르치기
              </button>
              <button 
                className={activeTab === 'stats' ? 'active' : ''}
                onClick={() => setActiveTab('stats')}
              >
                통계
              </button>
            </div>

            <div className="tab-content">
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

                  <div className="available-traits">
                    <h5>획득 가능한 특성</h5>
                    <div className="trait-list">
                      {geneticTraits.filter(trait => 
                        !selectedEntity.geneticTraits?.includes(trait.id)
                      ).map(trait => (
                        <div key={trait.id} className="trait-item available">
                          <div className="trait-name">{trait.name}</div>
                          <div className="trait-description">{trait.description}</div>
                          <div className="trait-rarity">희귀도: {(trait.rarity * 100).toFixed(1)}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'learning' && (
                <div className="learning-tab">
                  <h5>학습 경험</h5>
                  <div className="learning-experiences">
                    {selectedEntity.learningExperiences && selectedEntity.learningExperiences.length > 0 ? (
                      selectedEntity.learningExperiences.slice(-10).reverse().map(experience => (
                        <div key={experience.id} className="experience-item">
                          <div className="experience-type">{experience.type}</div>
                          <div className="experience-target">{experience.target}</div>
                          <div className="experience-value">+{experience.value.toFixed(2)}</div>
                          <div className="experience-description">{experience.description}</div>
                        </div>
                      ))
                    ) : (
                      <div className="no-experiences">학습 경험이 없습니다.</div>
                    )}
                  </div>

                  <h5>스킬 수준</h5>
                  <div className="skill-grid">
                    {Object.entries(selectedEntity.skills).map(([skill, level]) => (
                      <div key={skill} className="skill-item">
                        <div className="skill-name">{getSkillName(skill)}</div>
                        <div className="skill-level">{level.toFixed(1)}</div>
                        <div className="skill-bar">
                          <div 
                            className="skill-progress" 
                            style={{ width: `${level}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'teaching' && (
                <div className="teaching-tab">
                  <h5>가르치기 세션</h5>
                  <div className="teaching-sessions">
                    <div className="no-sessions">현재 가르치기 세션이 없습니다.</div>
                  </div>

                  <h5>지식</h5>
                  <div className="knowledge-list">
                    {Object.keys(selectedEntity.knowledge).length > 0 ? (
                      Object.entries(selectedEntity.knowledge).map(([knowledgeId, value]) => (
                        <div key={knowledgeId} className="knowledge-item">
                          <div className="knowledge-id">{knowledgeId}</div>
                          <div className="knowledge-value">{(value * 100).toFixed(1)}%</div>
                        </div>
                      ))
                    ) : (
                      <div className="no-knowledge">획득한 지식이 없습니다.</div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="stats-tab">
                  <h5>기본 능력치</h5>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-label">힘</div>
                      <div className="stat-value">{selectedEntity.stats.str}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">민첩</div>
                      <div className="stat-value">{selectedEntity.stats.agi}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">체력</div>
                      <div className="stat-value">{selectedEntity.stats.end}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">지능</div>
                      <div className="stat-value">{selectedEntity.stats.int}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">지각</div>
                      <div className="stat-value">{selectedEntity.stats.per}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">매력</div>
                      <div className="stat-value">{selectedEntity.stats.cha}</div>
                    </div>
                  </div>

                  <h5>후성유전</h5>
                  <div className="epigenetics-grid">
                    <div className="epi-item">
                      <div className="epi-label">생존</div>
                      <div className="epi-value">{selectedEntity.epi.survival.toFixed(3)}</div>
                    </div>
                    <div className="epi-item">
                      <div className="epi-label">번식</div>
                      <div className="epi-value">{selectedEntity.epi.reproduction.toFixed(3)}</div>
                    </div>
                    <div className="epi-item">
                      <div className="epi-label">호기심</div>
                      <div className="epi-value">{selectedEntity.epi.curiosity.toFixed(3)}</div>
                    </div>
                    <div className="epi-item">
                      <div className="epi-label">사회성</div>
                      <div className="epi-value">{selectedEntity.epi.social.toFixed(3)}</div>
                    </div>
                    <div className="epi-item">
                      <div className="epi-label">명예</div>
                      <div className="epi-value">{selectedEntity.epi.prestige.toFixed(3)}</div>
                    </div>
                    <div className="epi-item">
                      <div className="epi-label">피로</div>
                      <div className="epi-value">{selectedEntity.epi.fatigue.toFixed(3)}</div>
                    </div>
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