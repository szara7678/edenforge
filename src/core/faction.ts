import { Entity, Vec2 } from '../types';
import { RNG } from './utils';
import { Logger } from './utils/logger';
import { FactionNameGenerator } from './utils/factionNameGenerator';


export interface Faction {
  id: string;
  name: string;
  leader: Entity | null;
  members: Entity[];
  color: string;
  territory: Vec2[];
  resources: Record<string, number>;
  relations: Record<string, number>; // 다른 파벌과의 관계 (-100 ~ 100)
  culture: {
    aggression: number; // 0-100, 공격성
    cooperation: number; // 0-100, 협력성
    innovation: number; // 0-100, 혁신성
    tradition: number; // 0-100, 전통성
  };
  stats: {
    population: number;
    military: number;
    economy: number;
    technology: number;
  };
}

export interface FactionRelation {
  from: string;
  to: string;
  value: number; // -100 ~ 100
  history: Array<{
    type: 'war' | 'peace' | 'trade' | 'alliance' | 'betrayal';
    timestamp: number;
    description: string;
  }>;
}

export class FactionSystem {
  private logger: Logger;
  private rng: RNG;
  private nameGenerator: FactionNameGenerator;
  private factions: Map<string, Faction> = new Map();
  private relations: Map<string, FactionRelation> = new Map();

  constructor(logger: Logger) {
    this.logger = logger;
    this.rng = new RNG();
    this.nameGenerator = new FactionNameGenerator();
  }

  // 파벌 생성
  createFaction(name: string, leader: Entity, color: string): Faction {
    const faction: Faction = {
      id: `faction_${Date.now()}_${this.rng.range(1000, 9999)}`,
      name,
      leader,
      members: [leader],
      color,
      territory: [leader.pos],
      resources: {
        food: 100,
        materials: 50,
        tools: 10,
        weapons: 5
      },
      relations: {},
      culture: {
        aggression: this.rng.range(20, 80),
        cooperation: this.rng.range(20, 80),
        innovation: this.rng.range(20, 80),
        tradition: this.rng.range(20, 80)
      },
      stats: {
        population: 1,
        military: 10,
        economy: 50,
        technology: 20
      }
    };

    this.factions.set(faction.id, faction);
    leader.factionId = faction.id;
    
    this.logger.success('faction', `${name} 파벌이 생성되었습니다.`, leader.id, leader.name, { factionId: faction.id });
    
    return faction;
  }

  // 랜덤 파벌 생성
  createRandomFaction(leader: Entity): Faction {
    const name = this.nameGenerator.generateFactionName();
    const color = this.generateRandomColor();
    return this.createFaction(name, leader, color);
  }

  // 랜덤 색상 생성
  private generateRandomColor(): string {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#ffd93d', '#6c5ce7', '#a29bfe', '#fd79a8',
      '#fdcb6e', '#e17055', '#00b894', '#00cec9', '#74b9ff', '#0984e3',
      '#55a3ff', '#00d2d3', '#54a0ff', '#5f27cd', '#ff9ff3', '#f368e0',
      '#ff9f43', '#ee5a24', '#ff6348', '#ff4757', '#ff3838', '#ff6b6b'
    ];
    return this.rng.choice(colors);
  }

  // 파벌에 멤버 추가
  addMemberToFaction(factionId: string, entity: Entity): boolean {
    const faction = this.factions.get(factionId);
    if (!faction) return false;

    if (entity.factionId) {
      // 기존 파벌에서 제거
      this.removeMemberFromFaction(entity.factionId, entity);
    }

    faction.members.push(entity);
    entity.factionId = factionId;
    faction.stats.population = faction.members.length;
    
    this.logger.info('faction', `${entity.name}이(가) ${faction.name}에 가입했습니다.`, entity.id, entity.name, { factionId });
    
    return true;
  }

  // 파벌에서 멤버 제거
  removeMemberFromFaction(factionId: string, entity: Entity): boolean {
    const faction = this.factions.get(factionId);
    if (!faction) return false;

    const index = faction.members.findIndex(member => member.id === entity.id);
    if (index === -1) return false;

    faction.members.splice(index, 1);
    entity.factionId = undefined;
    faction.stats.population = faction.members.length;

    // 리더가 떠나면 새로운 리더 선정
    if (faction.leader?.id === entity.id) {
      faction.leader = faction.members.length > 0 ? faction.members[0] : null;
    }

    this.logger.warning('faction', `${entity.name}이(가) ${faction.name}에서 떠났습니다.`, entity.id, entity.name, { factionId });
    
    return true;
  }

  // 사망한 멤버 제거
  private removeDeadMembers(faction: Faction): void {
    const deadMembers = faction.members.filter(member => member.hp <= 0);
    
    for (const deadMember of deadMembers) {
      this.removeMemberFromFaction(faction.id, deadMember);
      this.logger.warning('faction', `${deadMember.name}이(가) 사망하여 ${faction.name}에서 제거되었습니다.`, deadMember.id, deadMember.name, { factionId: faction.id });
    }
  }

  // 파벌 관계 설정
  setFactionRelation(fromId: string, toId: string, value: number, reason: string): void {
    const relationKey = `${fromId}_${toId}`;
    const reverseKey = `${toId}_${fromId}`;

    let relation = this.relations.get(relationKey);
    if (!relation) {
      relation = {
        from: fromId,
        to: toId,
        value: 0,
        history: []
      };
      this.relations.set(relationKey, relation);
    }

    const oldValue = relation.value;
    relation.value = Math.max(-100, Math.min(100, value));
    
    // 관계 변화 기록
    relation.history.push({
      type: this.getRelationType(relation.value),
      timestamp: Date.now(),
      description: reason
    });

    // 상호 관계 설정 (대칭적)
    let reverseRelation = this.relations.get(reverseKey);
    if (!reverseRelation) {
      reverseRelation = {
        from: toId,
        to: fromId,
        value: 0,
        history: []
      };
      this.relations.set(reverseKey, reverseRelation);
    }
    reverseRelation.value = relation.value;

    // 파벌 내부 관계 업데이트
    const fromFaction = this.factions.get(fromId);
    const toFaction = this.factions.get(toId);
    if (fromFaction && toFaction) {
      fromFaction.relations[toId] = relation.value;
      toFaction.relations[fromId] = relation.value;
    }

    this.logger.info('faction', `${fromFaction?.name}과(와) ${toFaction?.name}의 관계가 ${oldValue}에서 ${relation.value}로 변경되었습니다.`, '', '', { reason });
  }

  // 관계 타입 판단
  private getRelationType(value: number): FactionRelation['history'][0]['type'] {
    if (value <= -50) return 'war';
    if (value <= -20) return 'betrayal';
    if (value <= 20) return 'peace';
    if (value <= 50) return 'trade';
    return 'alliance';
  }

  // 파벌 간 전투
  initiateFactionWar(attackerFaction: Faction, defenderFaction: Faction): void {
    if (attackerFaction.id === defenderFaction.id) return;

    const relation = this.getFactionRelation(attackerFaction.id, defenderFaction.id);
    if (relation && relation.value > -30) {
      // 관계가 너무 좋으면 전쟁 불가
      return;
    }

    // 전쟁 선포
    this.setFactionRelation(attackerFaction.id, defenderFaction.id, -50, '전쟁 선포');
    this.logger.warning('faction', `${attackerFaction.name}이(가) ${defenderFaction.name}에 전쟁을 선포했습니다!`, '', '', { 
      attacker: attackerFaction.name, 
      defender: defenderFaction.name 
    });

    // 전투 실행
    this.executeFactionCombat(attackerFaction, defenderFaction);
  }

  // 파벌 전투 실행
  private executeFactionCombat(attackerFaction: Faction, defenderFaction: Faction): void {
    const attackerMembers = attackerFaction.members.filter(m => m.hp > 0 && m.stamina > 20);
    const defenderMembers = defenderFaction.members.filter(m => m.hp > 0 && m.stamina > 20);

    if (attackerMembers.length === 0 || defenderMembers.length === 0) {
      return;
    }

    // 전투 라운드 - 엔티티의 전투 스킬과 스탯에 따라 전투력 계산
    const rounds = Math.min(3, Math.min(attackerMembers.length, defenderMembers.length));
    
    let attackerWins = 0;
    let defenderWins = 0;
    
    for (let i = 0; i < rounds; i++) {
      const attacker = this.rng.pick(attackerMembers);
      const defender = this.rng.pick(defenderMembers);

      if (attacker.hp <= 0 || defender.hp <= 0) continue;

      // 엔티티의 전투 스킬과 스탯을 고려한 전투력 계산
      const attackerPower = attacker.skills.combat + attacker.stats.str * 0.5 + attacker.stats.agi * 0.3;
      const defenderPower = defender.skills.combat + defender.stats.str * 0.5 + defender.stats.agi * 0.3;
      
      // 전투력 차이에 따른 승률 계산
      const powerDiff = attackerPower - defenderPower;
      const winChance = 0.5 + (powerDiff / 200); // 전투력 차이에 따른 승률 조정
      const finalWinChance = Math.max(0.1, Math.min(0.9, winChance));
      
      if (this.rng.bool(finalWinChance)) {
        // 공격자 승리
        attackerWins++;
        // 방어자에게 데미지 (증가)
        defender.hp = Math.max(0, defender.hp - Math.floor(attackerPower / 5));
        // 공격자 스킬 향상
        attacker.skills.combat = Math.min(100, attacker.skills.combat + 1);
      } else {
        // 방어자 승리
        defenderWins++;
        // 공격자에게 데미지 (증가)
        attacker.hp = Math.max(0, attacker.hp - Math.floor(defenderPower / 5));
        // 방어자 스킬 향상
        defender.skills.combat = Math.min(100, defender.skills.combat + 1);
      }
    }

    // 전투 결과에 따른 관계 변화
    const attackerCasualties = attackerMembers.filter(m => m.hp <= 0).length;
    const defenderCasualties = defenderMembers.filter(m => m.hp <= 0).length;

    if (defenderWins > attackerWins || defenderCasualties < attackerCasualties) {
      // 방어자 승리
      this.setFactionRelation(attackerFaction.id, defenderFaction.id, -60, '전투 패배');
      this.logger.success('faction', `${defenderFaction.name}이(가) ${attackerFaction.name}의 공격을 막아냈습니다!`, '', '', { 
        attacker: attackerFaction.name, 
        defender: defenderFaction.name,
        casualties: { attacker: attackerCasualties, defender: defenderCasualties },
        wins: { attacker: attackerWins, defender: defenderWins }
      });
    } else if (attackerWins > defenderWins || attackerCasualties < defenderCasualties) {
      // 공격자 승리
      this.setFactionRelation(attackerFaction.id, defenderFaction.id, -70, '전투 승리');
      this.logger.success('faction', `${attackerFaction.name}이(가) ${defenderFaction.name}을(를) 물리쳤습니다!`, '', '', { 
        attacker: attackerFaction.name, 
        defender: defenderFaction.name,
        casualties: { attacker: attackerCasualties, defender: defenderCasualties },
        wins: { attacker: attackerWins, defender: defenderWins }
      });
    } else {
      // 무승부
      this.setFactionRelation(attackerFaction.id, defenderFaction.id, -40, '전투 무승부');
      this.logger.info('faction', `${attackerFaction.name}과(와) ${defenderFaction.name}의 전투가 무승부로 끝났습니다.`, '', '', { 
        casualties: { attacker: attackerCasualties, defender: defenderCasualties },
        wins: { attacker: attackerWins, defender: defenderWins }
      });
    }
  }

  // 파벌 관계 조회
  getFactionRelation(fromId: string, toId: string): FactionRelation | null {
    const relationKey = `${fromId}_${toId}`;
    return this.relations.get(relationKey) || null;
  }

  // 파벌 업데이트
  updateFactions(world: any): void {
    for (const faction of this.factions.values()) {
      // 사망한 멤버 제거
      this.removeDeadMembers(faction);
      
      this.updateFactionStats(faction);
      this.updateFactionTerritory(faction);
      this.updateFactionRelations(faction);
      this.updateFactionSurvival(faction);
    }
    
    // 파벌 간 상호작용
    this.updateFactionInteractions();
    
    // 새로운 파벌 생성 시도
    this.attemptNewFactionCreation(world);
  }

  // 파벌 통계 업데이트
  private updateFactionStats(faction: Faction): void {
    // 생존한 멤버만 필터링
    const aliveMembers = faction.members.filter(m => m.hp > 0);
    
    // 인구 통계 - 생존한 멤버만 계산
    faction.stats.population = aliveMembers.length;
    
    // 멤버가 없으면 모든 통계를 0으로 설정
    if (aliveMembers.length === 0) {
      faction.stats.military = 0;
      faction.stats.economy = 0;
      faction.stats.technology = 0;
      return;
    }
    
    // 엔티티 스킬에 따른 자원 생산
    this.updateFactionResources(faction, aliveMembers);
    
    // 군사력 계산 - 생존한 멤버만
    const totalCombatSkill = aliveMembers.reduce((sum, m) => sum + m.skills.combat, 0);
    const totalWeapons = aliveMembers.reduce((sum, m) => {
      return sum + (m.inventory.items['무기'] || 0) + (m.inventory.items['도구'] || 0);
    }, 0);
    faction.stats.military = Math.floor((totalCombatSkill + totalWeapons * 10) / aliveMembers.length);
    
    // 경제력 계산 - 자원과 스킬 기반
    const totalResources = Object.values(faction.resources).reduce((sum, val) => sum + val, 0);
    const totalTradeSkill = aliveMembers.reduce((sum, m) => sum + (m.skills.trade || 0), 0);
    faction.stats.economy = Math.floor((totalResources + totalTradeSkill * 2) / 10);
    
    // 기술력 계산 - 생존한 멤버만
    const totalResearchSkill = aliveMembers.reduce((sum, m) => sum + (m.skills.analyze || 0), 0);
    faction.stats.technology = Math.floor(totalResearchSkill / aliveMembers.length);
  }

  // 파벌 자원 업데이트 - 엔티티 스킬 기반
  private updateFactionResources(faction: Faction, aliveMembers: Entity[]): void {
    // 수집 스킬에 따른 식량 생산
    const totalGatherSkill = aliveMembers.reduce((sum, m) => sum + m.skills.gather, 0);
    const foodProduction = Math.floor(totalGatherSkill / aliveMembers.length);
    faction.resources.food = Math.min(1000, faction.resources.food + foodProduction);
    
    // 제작 스킬에 따른 도구 생산
    const totalCraftSkill = aliveMembers.reduce((sum, m) => sum + m.skills.craft, 0);
    const toolProduction = Math.floor(totalCraftSkill / (aliveMembers.length * 10));
    faction.resources.tools = Math.min(100, faction.resources.tools + toolProduction);
    
    // 건설 스킬에 따른 재료 소비 및 무기 생산
    const totalBuildSkill = aliveMembers.reduce((sum, m) => sum + m.skills.build, 0);
    if (faction.resources.materials >= 5 && totalBuildSkill > 30) {
      const weaponProduction = Math.floor(totalBuildSkill / (aliveMembers.length * 20));
      faction.resources.weapons = Math.min(50, faction.resources.weapons + weaponProduction);
      faction.resources.materials = Math.max(0, faction.resources.materials - weaponProduction * 2);
    }
    
    // 자원 소모 (인구에 따른)
    const consumption = aliveMembers.length * 2;
    faction.resources.food = Math.max(0, faction.resources.food - consumption);
  }

  // 파벌 영토 업데이트
  private updateFactionTerritory(faction: Faction): void {
    const aliveMembers = faction.members.filter(m => m.hp > 0);
    if (aliveMembers.length === 0) return;

    // 멤버들의 위치를 기반으로 영토 계산
    const positions = aliveMembers.map(m => m.pos);
    faction.territory = positions;
    
    // 영토 크기에 따른 자원 보너스
    const territorySize = positions.length;
    if (territorySize > 5) {
      // 큰 영토를 가진 파벌은 자원 보너스
      faction.resources.food = Math.min(1000, faction.resources.food + territorySize);
      faction.resources.materials = Math.min(500, faction.resources.materials + territorySize * 0.5);
    }
  }

  // 파벌 관계 업데이트
  private updateFactionRelations(faction: Faction): void {
    for (const otherFaction of this.factions.values()) {
      if (faction.id === otherFaction.id) continue;

      const relation = this.getFactionRelation(faction.id, otherFaction.id);
      if (!relation) {
        // 초기 관계 설정
        const initialValue = this.rng.range(-20, 20);
        this.setFactionRelation(faction.id, otherFaction.id, initialValue, '초기 관계 설정');
      }
    }
  }

  // 파벌 생존 업데이트
  private updateFactionSurvival(faction: Faction): void {
    const aliveMembers = faction.members.filter(m => m.hp > 0);
    
    // 인구수가 0이면 파벌 삭제
    if (faction.stats.population === 0) {
      this.removeFaction(faction.id);
      this.logger.warning('faction', `${faction.name} 파벌의 인구수가 0이 되어 해산되었습니다.`, '', '', { factionId: faction.id });
      return;
    }
    
    // 모든 멤버가 사망했으면 파벌 해산
    if (aliveMembers.length === 0) {
      this.removeFaction(faction.id);
      this.logger.warning('faction', `${faction.name} 파벌의 모든 멤버가 사망하여 해산되었습니다.`, '', '', { factionId: faction.id });
      return;
    }
    
    // 리더가 사망했으면 새로운 리더 선정
    if (faction.leader && faction.leader.hp <= 0) {
      faction.leader = aliveMembers[0];
      this.logger.info('faction', `${faction.name}의 새로운 리더가 선정되었습니다.`, faction.leader.id, faction.leader.name);
    }
    
    // 파벌이 너무 약해지면 해산 가능성
    if (aliveMembers.length === 1 && this.rng.bool(0.1)) {
      this.removeFaction(faction.id);
      this.logger.warning('faction', `${faction.name} 파벌이 약해져서 해산되었습니다.`, '', '', { factionId: faction.id });
    }
  }

  // 파벌 간 상호작용 업데이트
  private updateFactionInteractions(): void {
    const factions = Array.from(this.factions.values());
    
    for (let i = 0; i < factions.length; i++) {
      for (let j = i + 1; j < factions.length; j++) {
        const faction1 = factions[i];
        const faction2 = factions[j];
        
        // 전쟁 시도
        if (this.rng.bool(0.05)) { // 5% 확률로 전쟁
          this.attemptFactionWar(faction1, faction2);
        }
        
        // 거래 시도
        if (this.rng.bool(0.1)) { // 10% 확률로 거래
          this.attemptFactionTrade(faction1, faction2);
        }
        
        // 동맹 시도
        if (this.rng.bool(0.03)) { // 3% 확률로 동맹
          this.attemptFactionAlliance(faction1, faction2);
        }
      }
    }
  }

  // 전쟁 시도
  private attemptFactionWar(faction1: Faction, faction2: Faction): void {
    const relation = this.getFactionRelation(faction1.id, faction2.id);
    if (!relation || relation.value > -20) return; // 관계가 너무 좋으면 전쟁 안함
    
    if (faction1.stats.military > faction2.stats.military * 1.5) {
      // faction1이 훨씬 강하면 전쟁 시도
      this.initiateFactionWar(faction1, faction2);
    } else if (faction2.stats.military > faction1.stats.military * 1.5) {
      // faction2가 훨씬 강하면 전쟁 시도
      this.initiateFactionWar(faction2, faction1);
    }
  }

  // 거래 시도
  private attemptFactionTrade(faction1: Faction, faction2: Faction): void {
    const relation = this.getFactionRelation(faction1.id, faction2.id);
    if (!relation || relation.value < 10) return; // 관계가 좋지 않으면 거래 안함
    
    const resources = ['food', 'materials', 'tools', 'weapons'];
    const resource = this.rng.choice(resources);
    const amount = this.rng.range(5, 20);
    
    this.initiateTrade(faction1, faction2, resource, amount);
  }

  // 동맹 시도
  private attemptFactionAlliance(faction1: Faction, faction2: Faction): void {
    const relation = this.getFactionRelation(faction1.id, faction2.id);
    if (!relation || relation.value < 50) return; // 관계가 충분히 좋지 않으면 동맹 안함
    
    this.formAlliance(faction1, faction2);
  }

  // 새로운 파벌 생성 시도
  private attemptNewFactionCreation(world: any): void {
    const factions = this.getAllFactions();
    const totalPopulation = factions.reduce((sum, f) => sum + f.stats.population, 0);
    
    // 총 인구가 50명 이상이고 파벌이 8개 미만일 때 새로운 파벌 생성 가능
    if (totalPopulation >= 50 && factions.length < 8) {
      const entities = world.state.entities.filter((e: Entity) => e.hp > 0 && !e.factionId);
      
      if (entities.length >= 3) {
        // 새로운 파벌을 만들 수 있는 충분한 독립 엔티티가 있음
        const leader = this.rng.choice(entities) as Entity;
        const newFaction = this.createRandomFaction(leader);
        
        // 추가 멤버들 찾기
        const nearbyEntities = entities.filter((e: Entity) => {
          const distance = Math.sqrt(
            Math.pow(e.pos.x - leader.pos.x, 2) + 
            Math.pow(e.pos.y - leader.pos.y, 2)
          );
          return distance < 100 && e.id !== leader.id;
        });
        
        // 2-4명의 멤버 추가
        const memberCount = Math.min(this.rng.range(2, 5), nearbyEntities.length);
        for (let i = 0; i < memberCount; i++) {
          const member = this.rng.choice(nearbyEntities) as Entity;
          this.addMemberToFaction(newFaction.id, member);
          nearbyEntities.splice(nearbyEntities.indexOf(member), 1);
        }
        
        this.logger.success('faction', `새로운 파벌 "${newFaction.name}"이(가) 형성되었습니다!`, '', '', { 
          factionId: newFaction.id, 
          memberCount: newFaction.members.length 
        });
      }
    }
  }

  // 파벌 간 거래
  initiateTrade(fromFaction: Faction, toFaction: Faction, resource: string, amount: number): boolean {
    const relation = this.getFactionRelation(fromFaction.id, toFaction.id);
    if (!relation || relation.value < 20) {
      return false; // 관계가 좋지 않으면 거래 불가
    }

    if (fromFaction.resources[resource] < amount) {
      return false; // 자원 부족
    }

    // 거래 실행
    fromFaction.resources[resource] -= amount;
    toFaction.resources[resource] = (toFaction.resources[resource] || 0) + amount;

    // 관계 개선
    this.setFactionRelation(fromFaction.id, toFaction.id, relation.value + 5, '거래 성사');

    this.logger.success('faction', `${fromFaction.name}이(가) ${toFaction.name}에게 ${resource} ${amount}개를 거래했습니다.`, '', '', { 
      from: fromFaction.name, 
      to: toFaction.name, 
      resource, 
      amount 
    });

    return true;
  }

  // 파벌 동맹 체결
  formAlliance(faction1: Faction, faction2: Faction): boolean {
    const relation = this.getFactionRelation(faction1.id, faction2.id);
    if (!relation || relation.value < 60) {
      return false; // 관계가 충분히 좋지 않으면 동맹 불가
    }

    this.setFactionRelation(faction1.id, faction2.id, 80, '동맹 체결');
    
    this.logger.success('faction', `${faction1.name}과(와) ${faction2.name}이(가) 동맹을 체결했습니다!`, '', '', { 
      faction1: faction1.name, 
      faction2: faction2.name 
    });

    return true;
  }

  // 파벌 정보 조회
  getFaction(factionId: string): Faction | null {
    return this.factions.get(factionId) || null;
  }

  // 모든 파벌 조회
  getAllFactions(): Faction[] {
    return Array.from(this.factions.values());
  }

  // 파벌 삭제
  removeFaction(factionId: string): boolean {
    const faction = this.factions.get(factionId);
    if (!faction) return false;

    // 멤버들을 파벌에서 제거
    for (const member of faction.members) {
      member.factionId = undefined;
    }

    // 파벌 삭제
    this.factions.delete(factionId);
    
    // 관련 관계들 삭제
    for (const [key, relation] of this.relations.entries()) {
      if (relation.from === factionId || relation.to === factionId) {
        this.relations.delete(key);
      }
    }

    this.logger.warning('faction', `${faction.name} 파벌이 해산되었습니다.`, '', '', { factionId });
    
    return true;
  }
} 