import React, { useState } from 'react';
import { Faction, FactionRelation, Entity } from '../types';

interface FactionPanelProps {
  factions: Faction[];
  factionRelations: FactionRelation[];
  entities: Entity[];
  onFactionSelect?: (faction: Faction) => void;
}

export const FactionPanel: React.FC<FactionPanelProps> = ({ 
  factions, 
  factionRelations, 
  entities,
  onFactionSelect 
}) => {
  const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'relations' | 'stats'>('overview');

  const handleFactionSelect = (faction: Faction) => {
    setSelectedFaction(faction);
    onFactionSelect?.(faction);
  };

  const getRelationValue = (factionId: string, targetId: string): number => {
    const relation = factionRelations.find(r => 
      (r.from === factionId && r.to === targetId) || 
      (r.from === targetId && r.to === factionId)
    );
    return relation?.value || 0;
  };

  const getRelationColor = (value: number): string => {
    if (value >= 60) return '#4CAF50'; // 동맹
    if (value >= 20) return '#8BC34A'; // 우호
    if (value >= -20) return '#FFC107'; // 중립
    if (value >= -50) return '#FF9800'; // 적대
    return '#F44336'; // 전쟁
  };

  const getRelationText = (value: number): string => {
    if (value >= 60) return '동맹';
    if (value >= 20) return '우호';
    if (value >= -20) return '중립';
    if (value >= -50) return '적대';
    return '전쟁';
  };

  return (
    <div className="faction-panel">
      <div className="faction-header">
        <h3>파벌 관리</h3>
        <div className="faction-count">
          총 {factions.length}개 파벌
        </div>
      </div>

      <div className="faction-content">
        <div className="faction-list">
          <h4>파벌 목록</h4>
          {factions.map(faction => (
            <div 
              key={faction.id}
              className={`faction-item ${selectedFaction?.id === faction.id ? 'selected' : ''}`}
              onClick={() => handleFactionSelect(faction)}
            >
              <div className="faction-color" style={{ backgroundColor: faction.color }}></div>
              <div className="faction-info">
                <div className="faction-name">{faction.name}</div>
                <div className="faction-stats">
                  인구: {faction.stats.population} | 
                  군사: {faction.stats.military} | 
                  경제: {faction.stats.economy}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedFaction && (
          <div className="faction-details">
            <div className="faction-tabs">
              <button 
                className={activeTab === 'overview' ? 'active' : ''}
                onClick={() => setActiveTab('overview')}
              >
                개요
              </button>
              <button 
                className={activeTab === 'members' ? 'active' : ''}
                onClick={() => setActiveTab('members')}
              >
                멤버
              </button>
              <button 
                className={activeTab === 'relations' ? 'active' : ''}
                onClick={() => setActiveTab('relations')}
              >
                관계
              </button>
              <button 
                className={activeTab === 'stats' ? 'active' : ''}
                onClick={() => setActiveTab('stats')}
              >
                통계
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'overview' && (
                <div className="overview-tab">
                  <div className="faction-header-info">
                    <h4>{selectedFaction.name}</h4>
                    <div className="faction-leader">
                      리더: {selectedFaction.leader?.name || '없음'}
                    </div>
                  </div>
                  
                  <div className="faction-culture">
                    <h5>문화 특성</h5>
                    <div className="culture-stats">
                      <div>공격성: {selectedFaction.culture.aggression}</div>
                      <div>협력성: {selectedFaction.culture.cooperation}</div>
                      <div>혁신성: {selectedFaction.culture.innovation}</div>
                      <div>전통성: {selectedFaction.culture.tradition}</div>
                    </div>
                  </div>

                  <div className="faction-resources">
                    <h5>자원</h5>
                    <div className="resource-list">
                      {Object.entries(selectedFaction.resources).map(([resource, amount]) => (
                        <div key={resource} className="resource-item">
                          <span className="resource-name">{resource}:</span>
                          <span className="resource-amount">{amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'members' && (
                <div className="members-tab">
                  <h5>멤버 목록 ({selectedFaction.members.length}명)</h5>
                  <div className="member-list">
                    {selectedFaction.members.map(member => (
                      <div key={member.id} className="member-item">
                        <div className="member-name">{member.name}</div>
                        <div className="member-stats">
                          HP: {Math.floor(member.hp)} | 
                          전투: {Math.floor(member.skills.combat)} | 
                          나이: {Math.floor(member.age)}
                        </div>
                        <div className="member-status">
                          {member.hp <= 0 ? '사망' : 
                           member.hp < 30 ? '부상' : 
                           member.stamina < 20 ? '피로' : '정상'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'relations' && (
                <div className="relations-tab">
                  <h5>파벌 관계</h5>
                  <div className="relation-list">
                    {factions.filter(f => f.id !== selectedFaction.id).map(otherFaction => {
                      const relationValue = getRelationValue(selectedFaction.id, otherFaction.id);
                      return (
                        <div key={otherFaction.id} className="relation-item">
                          <div className="relation-faction">
                            <div 
                              className="relation-color" 
                              style={{ backgroundColor: otherFaction.color }}
                            ></div>
                            <span className="relation-name">{otherFaction.name}</span>
                          </div>
                          <div 
                            className="relation-value"
                            style={{ color: getRelationColor(relationValue) }}
                          >
                            {getRelationText(relationValue)} ({relationValue})
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="stats-tab">
                  <h5>파벌 통계</h5>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-label">인구</div>
                      <div className="stat-value">{selectedFaction.stats.population}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">군사력</div>
                      <div className="stat-value">{selectedFaction.stats.military}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">경제력</div>
                      <div className="stat-value">{selectedFaction.stats.economy}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">기술력</div>
                      <div className="stat-value">{selectedFaction.stats.technology}</div>
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