import React, { useState } from 'react';
import { WorldState } from '../types';
import { ChartsPanel } from './ChartsPanel';

type StatsTabType = 'overview' | 'entities' | 'factions' | 'ecosystem' | 'materials' | 'charts';

interface StatsPanelProps {
  worldState: WorldState;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ worldState }) => {
  const [activeTab, setActiveTab] = useState<StatsTabType>('overview');
  
  // 기본 통계 계산
  const totalEntities = worldState.entities.length;
  const aliveEntities = worldState.entities.filter(e => e.hp > 0).length;
  const deadEntities = totalEntities - aliveEntities;
  
  // 평균 스탯 계산
  const avgStats = {
    str: 0,
    agi: 0,
    end: 0,
    int: 0,
    per: 0,
    cha: 0
  };
  
  if (aliveEntities > 0) {
    worldState.entities.forEach(entity => {
      avgStats.str += entity.stats.str;
      avgStats.agi += entity.stats.agi;
      avgStats.end += entity.stats.end;
      avgStats.int += entity.stats.int;
      avgStats.per += entity.stats.per;
      avgStats.cha += entity.stats.cha;
    });
    
    Object.keys(avgStats).forEach(key => {
      avgStats[key as keyof typeof avgStats] = avgStats[key as keyof typeof avgStats] / aliveEntities;
    });
  }

  // 평균 스킬 계산
  const avgSkills = {
    gather: 0,
    analyze: 0,
    craft: 0,
    build: 0,
    cook: 0,
    combat: 0,
    trade: 0,
    lead: 0
  };
  
  if (aliveEntities > 0) {
    worldState.entities.forEach(entity => {
      Object.keys(avgSkills).forEach(skill => {
        avgSkills[skill as keyof typeof avgSkills] += entity.skills[skill as keyof typeof entity.skills];
      });
    });
    
    Object.keys(avgSkills).forEach(key => {
      avgSkills[key as keyof typeof avgSkills] = avgSkills[key as keyof typeof avgSkills] / aliveEntities;
    });
  }

  // 파벌 통계
  const factionStats = {
    total: worldState.factions.length,
    avgMembers: worldState.factions.length > 0 
      ? worldState.factions.reduce((sum, f) => sum + f.members.length, 0) / worldState.factions.length 
      : 0,
    avgPopulation: worldState.factions.length > 0
      ? worldState.factions.reduce((sum, f) => sum + f.stats.population, 0) / worldState.factions.length
      : 0,
    avgMilitary: worldState.factions.length > 0
      ? worldState.factions.reduce((sum, f) => sum + f.stats.military, 0) / worldState.factions.length
      : 0,
    avgEconomy: worldState.factions.length > 0
      ? worldState.factions.reduce((sum, f) => sum + f.stats.economy, 0) / worldState.factions.length
      : 0,
    avgTechnology: worldState.factions.length > 0
      ? worldState.factions.reduce((sum, f) => sum + f.stats.technology, 0) / worldState.factions.length
      : 0
  };

  // 생태계 통계
  const ecosystemStats = {
    animals: worldState.animals.length,
    plants: worldState.plants.length,
    pulses: worldState.pulses.length,
    biomes: worldState.biomes.length
  };

  // 재료 통계 (동적 티어 지원)
  const materialTiers = Array.from(new Set(worldState.materials.map(m => m.tier))).sort((a, b) => a - b);
  const materialStats = {
    total: worldState.materials.length,
    byTier: materialTiers.reduce((acc, tier) => {
      acc[tier] = worldState.materials.filter(m => m.tier === tier).length;
      return acc;
    }, {} as Record<number, number>),
    topTiers: materialTiers.slice(-8) // 상위 8개 티어만
  };

  const tabs = [
    { id: 'overview', name: '개요', icon: '📊' },
    { id: 'entities', name: '엔티티', icon: '👥' },
    { id: 'factions', name: '파벌', icon: '⚔️' },
    { id: 'ecosystem', name: '생태계', icon: '🌿' },
    { id: 'materials', name: '재료', icon: '🔬' },
    { id: 'charts', name: '차트', icon: '📈' }
  ];

  const renderOverview = () => (
    <>
      {/* 기본 통계 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#4ecdc4', fontSize: '14px' }}>기본 정보</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ padding: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>총 엔티티</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{totalEntities}</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>생존 엔티티</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#6bcf7f' }}>{aliveEntities}</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>사망 엔티티</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff6b6b' }}>{deadEntities}</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>생존률</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
              {totalEntities > 0 ? ((aliveEntities / totalEntities) * 100).toFixed(1) : '0'}%
            </div>
          </div>
        </div>
      </div>

      {/* 파벌 요약 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#4ecdc4', fontSize: '14px' }}>파벌 요약</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ padding: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>총 파벌</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{factionStats.total}</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>평균 멤버</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{factionStats.avgMembers.toFixed(1)}</div>
          </div>
        </div>
      </div>

      {/* 생태계 요약 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#4ecdc4', fontSize: '14px' }}>생태계 요약</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ padding: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>동물</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{ecosystemStats.animals}</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>식물</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{ecosystemStats.plants}</div>
          </div>
        </div>
      </div>
    </>
  );

  const renderEntities = () => (
    <>
      {/* 평균 스탯 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#4ecdc4', fontSize: '14px' }}>평균 스탯</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>힘</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{avgStats.str.toFixed(1)}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>민첩</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{avgStats.agi.toFixed(1)}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>체력</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{avgStats.end.toFixed(1)}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>지능</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{avgStats.int.toFixed(1)}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>지각</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{avgStats.per.toFixed(1)}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>매력</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{avgStats.cha.toFixed(1)}</div>
          </div>
        </div>
      </div>

      {/* 평균 스킬 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#4ecdc4', fontSize: '14px' }}>평균 스킬</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>채집</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{avgSkills.gather.toFixed(1)}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>분석</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{avgSkills.analyze.toFixed(1)}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>제작</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{avgSkills.craft.toFixed(1)}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>건설</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{avgSkills.build.toFixed(1)}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>요리</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{avgSkills.cook.toFixed(1)}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>전투</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{avgSkills.combat.toFixed(1)}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>거래</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{avgSkills.trade.toFixed(1)}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>리더십</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{avgSkills.lead.toFixed(1)}</div>
          </div>
        </div>
      </div>
    </>
  );

  const renderFactions = () => (
    <>
      {/* 파벌 통계 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#4ecdc4', fontSize: '14px' }}>파벌 통계</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>총 파벌</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{factionStats.total}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>평균 멤버</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{factionStats.avgMembers.toFixed(1)}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>평균 인구</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{factionStats.avgPopulation.toFixed(1)}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>평균 군사력</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{factionStats.avgMilitary.toFixed(1)}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>평균 경제력</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{factionStats.avgEconomy.toFixed(1)}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>평균 기술력</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{factionStats.avgTechnology.toFixed(1)}</div>
          </div>
        </div>
      </div>
    </>
  );

  const renderEcosystem = () => (
    <>
      {/* 생태계 통계 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#4ecdc4', fontSize: '14px' }}>생태계 통계</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>동물</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{ecosystemStats.animals}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>식물</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{ecosystemStats.plants}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>Pulse</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{ecosystemStats.pulses}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>바이옴</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{ecosystemStats.biomes}</div>
          </div>
        </div>
      </div>
    </>
  );

  const renderMaterials = () => (
    <>
      {/* 재료 통계 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#4ecdc4', fontSize: '14px' }}>재료 통계</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>총 재료</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{materialStats.total}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>총 티어</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{materialTiers.length}</div>
          </div>
        </div>
      </div>

      {/* 상위 8개 티어 통계 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#4ecdc4', fontSize: '14px' }}>상위 티어별 재료</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {materialStats.topTiers.map(tier => (
            <div key={tier} style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
              <div style={{ fontSize: '10px', opacity: 0.7 }}>티어 {tier}</div>
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{materialStats.byTier[tier] || 0}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderCharts = () => (
    <ChartsPanel worldState={worldState} />
  );

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontSize: '12px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#4ecdc4', padding: '0 15px' }}>📊 게임 통계</h3>
      
      {/* 탭 버튼 */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #333',
        padding: '0 15px'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as StatsTabType)}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: activeTab === tab.id ? '#4ecdc4' : 'transparent',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            {tab.icon} {tab.name}
          </button>
        ))}
      </div>
      
      {/* 탭 콘텐츠 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '15px'
      }}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'entities' && renderEntities()}
        {activeTab === 'factions' && renderFactions()}
        {activeTab === 'ecosystem' && renderEcosystem()}
        {activeTab === 'materials' && renderMaterials()}
        {activeTab === 'charts' && renderCharts()}
      </div>
    </div>
  );
}; 