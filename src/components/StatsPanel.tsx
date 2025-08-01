import React from 'react';
import { WorldState } from '../types';

interface StatsPanelProps {
  worldState: WorldState;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ worldState }) => {
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

  // 재료 통계
  const materialStats = {
    total: worldState.materials.length,
    byTier: {
      1: worldState.materials.filter(m => m.tier === 1).length,
      2: worldState.materials.filter(m => m.tier === 2).length,
      3: worldState.materials.filter(m => m.tier === 3).length,
      4: worldState.materials.filter(m => m.tier === 4).length,
      5: worldState.materials.filter(m => m.tier === 5).length
    }
  };

  return (
    <div style={{
      padding: '15px',
      height: '100%',
      overflowY: 'auto',
      fontSize: '12px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#4ecdc4' }}>📊 게임 통계</h3>
      
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

      {/* 재료 통계 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#4ecdc4', fontSize: '14px' }}>재료 통계</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>총 재료</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{materialStats.total}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>티어 1</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{materialStats.byTier[1]}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>티어 2</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{materialStats.byTier[2]}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>티어 3</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{materialStats.byTier[3]}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>티어 4</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{materialStats.byTier[4]}</div>
          </div>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>티어 5</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{materialStats.byTier[5]}</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 