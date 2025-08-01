import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WorldState } from '../types';

interface ChartsPanelProps {
  worldState: WorldState;
}

type ChartType = 'population' | 'skills' | 'factions' | 'materials' | 'ecosystem' | 'emotions';

export const ChartsPanel: React.FC<ChartsPanelProps> = ({ worldState }) => {
  const [activeChart, setActiveChart] = useState<ChartType>('population');
  const [timeRange, setTimeRange] = useState<number>(100); // 기본값을 100으로 변경

  // 인구 변화 데이터 (시간순 점선 그래프)
  const populationData = useMemo(() => {
    const aliveEntities = worldState.entities.filter(e => e.hp > 0);
    const totalEntities = worldState.entities.length;
    
    // 선택된 시간 범위에 따른 데이터 포인트 생성
    const timePoints = Array.from({ length: timeRange }, (_, i) => i);
    
    return timePoints.map((point, index) => ({
      time: point,
      population: Math.max(0, aliveEntities.length - (timeRange - 1 - index) * 0.5), // 점진적 변화 시뮬레이션
      total: Math.max(0, totalEntities - (timeRange - 1 - index) * 0.3)
    }));
  }, [worldState.entities, timeRange]);

  // 스킬 분포 데이터
  const skillsData = useMemo(() => {
    const aliveEntities = worldState.entities.filter(e => e.hp > 0);
    if (aliveEntities.length === 0) return [];

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

    aliveEntities.forEach(entity => {
      Object.keys(avgSkills).forEach(skill => {
        avgSkills[skill as keyof typeof avgSkills] += entity.skills[skill as keyof typeof entity.skills];
      });
    });

    Object.keys(avgSkills).forEach(key => {
      avgSkills[key as keyof typeof avgSkills] = avgSkills[key as keyof typeof avgSkills] / aliveEntities.length;
    });

    return [
      { name: '채집', value: avgSkills.gather.toFixed(1) },
      { name: '분석', value: avgSkills.analyze.toFixed(1) },
      { name: '제작', value: avgSkills.craft.toFixed(1) },
      { name: '건설', value: avgSkills.build.toFixed(1) },
      { name: '요리', value: avgSkills.cook.toFixed(1) },
      { name: '전투', value: avgSkills.combat.toFixed(1) },
      { name: '거래', value: avgSkills.trade.toFixed(1) },
      { name: '리더십', value: avgSkills.lead.toFixed(1) }
    ];
  }, [worldState.entities]);

  // 파벌 통계 데이터
  const factionsData = useMemo(() => {
    return worldState.factions.map(faction => ({
      name: faction.name,
      population: faction.stats.population,
      military: faction.stats.military,
      economy: faction.stats.economy,
      technology: faction.stats.technology,
      members: faction.members.length
    }));
  }, [worldState.factions]);

  // 재료 분포 데이터 (동적 티어 지원)
  const materialsData = useMemo(() => {
    const materialTiers = Array.from(new Set(worldState.materials.map(m => m.tier))).sort((a, b) => a - b);
    const topTiers = materialTiers.slice(-8); // 상위 8개 티어만
    
    const colors = ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4ecdc4', '#a8e6cf', '#ff9ff3', '#f368e0', '#ff6348'];
    
    return topTiers.map((tier, index) => ({
      name: `티어 ${tier}`,
      value: worldState.materials.filter(m => m.tier === tier).length,
      color: colors[index % colors.length]
    }));
  }, [worldState.materials]);

  // 생태계 데이터
  const ecosystemData = useMemo(() => {
    return [
      { name: '동물', value: worldState.animals.length, color: '#ff6b6b' },
      { name: '식물', value: worldState.plants.length, color: '#6bcf7f' },
      { name: 'Pulse', value: worldState.pulses.length, color: '#4ecdc4' },
      { name: '바이옴', value: worldState.biomes.length, color: '#ffd93d' }
    ];
  }, [worldState.animals, worldState.plants, worldState.pulses, worldState.biomes]);

  // 감정 분포 데이터 (확장된 감정 상태)
  const emotionsData = useMemo(() => {
    const aliveEntities = worldState.entities.filter(e => e.hp > 0);
    if (aliveEntities.length === 0) return [];

    // 확장된 감정 상태 계산
    const emotionCounts = {
      happiness: 0,
      fear: 0,
      anger: 0,
      curiosity: 0,
      satisfaction: 0,
      stress: 0,
      excitement: 0,
      sadness: 0,
      anxiety: 0,
      joy: 0,
      frustration: 0,
      pride: 0,
      loneliness: 0,
      hope: 0,
      despair: 0,
      calmness: 0,
      irritation: 0,
      gratitude: 0,
      envy: 0,
      confidence: 0,
      confusion: 0,
      determination: 0
    };

    aliveEntities.forEach(entity => {
      // 간단한 감정 상태 계산 (실제로는 EmotionSystem 사용)
      const health = entity.hp / 100;
      const stamina = entity.stamina / 100;
      const morale = entity.morale / 100;
      const hunger = entity.hunger / 100;
      
      // 스트레스 계산
      const stress = (health < 0.5 ? 0.5 : 0) + (stamina < 0.3 ? 0.3 : 0) + (hunger > 0.5 ? 0.4 : 0);
      
      // 각 감정별 임계값 설정
      if (health > 0.7 && morale > 0.6) emotionCounts.happiness++;
      if (health < 0.3 || hunger > 0.7) emotionCounts.fear++;
      if (morale < 0.3 || hunger > 0.6) emotionCounts.anger++;
      if (entity.stats.int > 60) emotionCounts.curiosity++;
      if (health > 0.6 && stamina > 0.5) emotionCounts.satisfaction++;
      if (health < 0.5 || stamina < 0.3 || hunger > 0.5) emotionCounts.stress++;
      if (health > 0.6 && morale > 0.5) emotionCounts.excitement++;
      if (health < 0.5 || morale < 0.3) emotionCounts.sadness++;
      if (health < 0.4 || stamina < 0.3) emotionCounts.anxiety++;
      if (health > 0.7 && morale > 0.7) emotionCounts.joy++;
      if (morale < 0.4 || hunger > 0.5) emotionCounts.frustration++;
      if (morale > 0.7 && health > 0.8) emotionCounts.pride++;
      if (morale < 0.3) emotionCounts.loneliness++;
      if (health > 0.5 && morale > 0.5) emotionCounts.hope++;
      if (health < 0.2 || morale < 0.1) emotionCounts.despair++;
      if (health > 0.6 && stress < 0.3) emotionCounts.calmness++;
      if (morale < 0.4 || stamina < 0.4) emotionCounts.irritation++;
      if (health > 0.6 && morale > 0.5) emotionCounts.gratitude++;
      if (morale < 0.5) emotionCounts.envy++;
      if (health > 0.7 && morale > 0.6) emotionCounts.confidence++;
      if (health < 0.4 || stamina < 0.3) emotionCounts.confusion++;
      if (morale > 0.5 && health > 0.5) emotionCounts.determination++;
    });

    const colors = [
      '#6bcf7f', '#ff6b6b', '#ffd93d', '#4ecdc4', '#a8e6cf', '#ff9ff3',
      '#f368e0', '#ff6348', '#00d2ff', '#ff9ff3', '#feca57', '#ff6b6b',
      '#48dbfb', '#0abde3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9ff3',
      '#feca57', '#ff6b6b', '#48dbfb', '#0abde3', '#54a0ff'
    ];

    return Object.entries(emotionCounts)
      .filter(([_, count]) => count > 0)
      .map(([emotion, count], index) => ({
        name: getEmotionName(emotion),
        value: count,
        color: colors[index % colors.length]
      }));
  }, [worldState.entities]);

  // 감정 이름 변환 함수
  const getEmotionName = (emotionKey: string): string => {
    const emotionNames: Record<string, string> = {
      happiness: '행복',
      fear: '공포',
      anger: '분노',
      curiosity: '호기심',
      satisfaction: '만족',
      stress: '스트레스',
      excitement: '흥미',
      sadness: '슬픔',
      anxiety: '불안',
      joy: '기쁨',
      frustration: '좌절',
      pride: '자부심',
      loneliness: '외로움',
      hope: '희망',
      despair: '절망',
      calmness: '평온',
      irritation: '짜증',
      gratitude: '감사',
      envy: '질투',
      confidence: '자신감',
      confusion: '혼란',
      determination: '의지'
    };
    return emotionNames[emotionKey] || emotionKey;
  };

  const chartTypes = [
    { id: 'population', name: '인구', icon: '👥' },
    { id: 'skills', name: '스킬', icon: '⚔️' },
    { id: 'factions', name: '파벌', icon: '⚔️' },
    { id: 'materials', name: '재료', icon: '🔬' },
    { id: 'ecosystem', name: '생태계', icon: '🌿' },
    { id: 'emotions', name: '감정', icon: '💭' }
  ];

  const renderChart = () => {
    switch (activeChart) {
            case 'population':
        return (
          <div>
            {/* 시간 범위 선택 UI */}
            <div style={{ 
              marginBottom: '15px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              fontSize: '12px'
            }}>
              <span style={{ color: '#4ecdc4', fontWeight: 'bold' }}>시간 범위:</span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '11px'
                }}
              >
                <option value={50}>50 틱</option>
                <option value={100}>100 틱</option>
                <option value={200}>200 틱</option>
                <option value={500}>500 틱</option>
                <option value={1000}>1000 틱</option>
              </select>
              <span style={{ opacity: 0.7, fontSize: '10px' }}>
                (현재 {timeRange}개 데이터 포인트)
              </span>
            </div>
            
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={populationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="population" 
                    stroke="#6bcf7f" 
                    strokeWidth={2}
                    dot={{ fill: '#6bcf7f', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#ff6b6b" 
                    strokeWidth={2}
                    dot={{ fill: '#ff6b6b', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'skills':
        return (
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#4ecdc4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'factions':
        return (
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={factionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="population" fill="#6bcf7f" />
                <Bar dataKey="military" fill="#ff6b6b" />
                <Bar dataKey="economy" fill="#ffd93d" />
                <Bar dataKey="technology" fill="#4ecdc4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'materials':
        return (
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                                 <Pie
                   data={materialsData}
                   cx="50%"
                   cy="50%"
                   labelLine={false}
                   label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                   outerRadius={80}
                   fill="#8884d8"
                   dataKey="value"
                 >
                  {materialsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      case 'ecosystem':
        return (
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ecosystemData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#4ecdc4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'emotions':
        return (
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                                 <Pie
                   data={emotionsData}
                   cx="50%"
                   cy="50%"
                   labelLine={false}
                   label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                   outerRadius={80}
                   fill="#8884d8"
                   dataKey="value"
                 >
                  {emotionsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      default:
        return <div>차트를 선택해주세요.</div>;
    }
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontSize: '12px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#4ecdc4', fontSize: '14px' }}>📈 게임 차트</h3>
      
      {/* 차트 타입 선택 */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ fontSize: '10px', marginBottom: '5px', opacity: 0.7 }}>차트 유형</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {chartTypes.map(chart => (
            <button
              key={chart.id}
              onClick={() => setActiveChart(chart.id as ChartType)}
              style={{
                padding: '6px 10px',
                backgroundColor: activeChart === chart.id ? '#4ecdc4' : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {chart.icon} {chart.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* 차트 영역 */}
      <div style={{
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '4px',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {renderChart()}
      </div>
      
      {/* 차트 설명 */}
      <div style={{
        marginTop: '10px',
        padding: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '4px',
        fontSize: '10px',
        opacity: 0.7
      }}>
        {activeChart === 'population' && '생존/사망 엔티티 분포'}
        {activeChart === 'skills' && '평균 스킬 수준 분포'}
        {activeChart === 'factions' && '파벌별 통계 비교'}
        {activeChart === 'materials' && '재료 티어별 분포'}
        {activeChart === 'ecosystem' && '생태계 구성 요소'}
        {activeChart === 'emotions' && '엔티티 감정 상태 분포'}
      </div>
    </div>
  );
}; 