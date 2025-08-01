import { Entity, Vec2 } from '../types';
import { RNG } from './utils';
import { Logger } from './utils/logger';
import { CombatSystem } from './combat';

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
  private combatSystem: CombatSystem;
  private factions: Map<string, Faction> = new Map();
  private relations: Map<string, FactionRelation> = new Map();

  constructor(logger: Logger) {
    this.logger = logger;
    this.rng = new RNG();
    this.combatSystem = new CombatSystem(logger);
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

    // 전투 라운드
    const rounds = Math.min(3, Math.min(attackerMembers.length, defenderMembers.length));
    
    for (let i = 0; i < rounds; i++) {
      const attacker = this.rng.pick(attackerMembers);
      const defender = this.rng.pick(defenderMembers);

      if (attacker.hp <= 0 || defender.hp <= 0) continue;

      const result = this.combatSystem.executeCombat(attacker, defender);
      if (result) {
        this.combatSystem.handleCombatAftermath(result);
      }
    }

    // 전투 결과에 따른 관계 변화
    const attackerCasualties = attackerMembers.filter(m => m.hp <= 0).length;
    const defenderCasualties = defenderMembers.filter(m => m.hp <= 0).length;

    if (defenderCasualties > attackerCasualties) {
      // 공격자 승리
      this.setFactionRelation(attackerFaction.id, defenderFaction.id, -70, '전투 승리');
      this.logger.success('faction', `${attackerFaction.name}이(가) ${defenderFaction.name}을(를) 물리쳤습니다!`, '', '', { 
        attacker: attackerFaction.name, 
        defender: defenderFaction.name,
        casualties: { attacker: attackerCasualties, defender: defenderCasualties }
      });
    } else if (attackerCasualties > defenderCasualties) {
      // 방어자 승리
      this.setFactionRelation(attackerFaction.id, defenderFaction.id, -60, '전투 패배');
      this.logger.success('faction', `${defenderFaction.name}이(가) ${attackerFaction.name}의 공격을 막아냈습니다!`, '', '', { 
        attacker: attackerFaction.name, 
        defender: defenderFaction.name,
        casualties: { attacker: attackerCasualties, defender: defenderCasualties }
      });
    } else {
      // 무승부
      this.setFactionRelation(attackerFaction.id, defenderFaction.id, -40, '전투 무승부');
      this.logger.info('faction', `${attackerFaction.name}과(와) ${defenderFaction.name}의 전투가 무승부로 끝났습니다.`, '', '', { 
        casualties: { attacker: attackerCasualties, defender: defenderCasualties }
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
      this.updateFactionStats(faction);
      this.updateFactionTerritory(faction);
      this.updateFactionRelations(faction);
    }
  }

  // 파벌 통계 업데이트
  private updateFactionStats(faction: Faction): void {
    const members = faction.members.filter(m => m.hp > 0);
    
    // 인구 통계
    faction.stats.population = members.length;
    
    // 군사력 계산
    const totalCombatSkill = members.reduce((sum, m) => sum + m.skills.combat, 0);
    const totalWeapons = members.reduce((sum, m) => {
      return sum + (m.inventory.items['무기'] || 0) + (m.inventory.items['도구'] || 0);
    }, 0);
    faction.stats.military = Math.floor((totalCombatSkill + totalWeapons * 10) / members.length);
    
    // 경제력 계산
    const totalResources = Object.values(faction.resources).reduce((sum, val) => sum + val, 0);
    faction.stats.economy = Math.floor(totalResources / 10);
    
    // 기술력 계산
    const totalResearchSkill = members.reduce((sum, m) => sum + m.skills.research, 0);
    faction.stats.technology = Math.floor(totalResearchSkill / members.length);
  }

  // 파벌 영토 업데이트
  private updateFactionTerritory(faction: Faction): void {
    const members = faction.members.filter(m => m.hp > 0);
    if (members.length === 0) return;

    // 멤버들의 위치를 기반으로 영토 계산
    const positions = members.map(m => m.pos);
    faction.territory = positions;
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