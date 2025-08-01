import { Entity, StimKey, ActionType } from '../types';
import { RNG, calculateStim, calculateDesire } from './utils';
import { Logger } from './utils/logger';


export interface ActionContext {
  entity: Entity;
  world: any;
  logger: Logger;
  rng: RNG;
}

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: any;
}

export class EntitySystem {
  private logger: Logger;
  private rng: RNG;

  constructor(logger: Logger) {
    this.logger = logger;
    this.rng = new RNG();
  }

  // 엔티티 업데이트 메인 로직
  updateEntity(entity: Entity, world: any): void {
    // 기본 상태 감소
    this.updateBasicStats(entity);
    
    // 생존 체크
    if (!this.checkSurvival(entity)) {
      this.logger.warning('entity', `${entity.name}이(가) 사망했습니다.`, entity.id, entity.name);
      return;
    }

    // Stim 계산
    const stim = calculateStim(entity);
    
    // 욕구 계산
    const desires = calculateDesire(entity, stim);
    
    // 행동 결정
    const action = this.decideAction(entity, desires, world);
    
    // 행동 실행
    this.executeAction(entity, action, world);
    
    // 학습 업데이트
    this.updateLearning(entity, action, stim);
  }

  private updateBasicStats(entity: Entity): void {
    // 기본 감소
    entity.stamina = Math.max(0, entity.stamina - 0.2);
    entity.hunger = Math.min(100, entity.hunger + 0.1);
    entity.age += 0.001;
    
    // HP 자연 회복/감소
    if (entity.stamina > 50) {
      entity.hp = Math.min(100, entity.hp + 0.1);
    } else {
      entity.hp = Math.max(0, entity.hp - 0.05);
    }
  }

  private checkSurvival(entity: Entity): boolean {
    // 사망 조건 체크
    if (entity.hp <= 0) {
      this.logDeath(entity, 'HP 부족', { hp: entity.hp, stamina: entity.stamina, hunger: entity.hunger });
      return false;
    }
    
    if (entity.hunger >= 100) {
      this.logDeath(entity, '극심한 배고픔', { hp: entity.hp, hunger: entity.hunger, lastAction: 'starvation' });
      return false;
    }
    
    if (entity.age >= 100) {
      this.logDeath(entity, '노화', { hp: entity.hp, age: entity.age, lifeSpan: 'natural' });
      return false;
    }
    
    // 위험 상태 경고
    if (entity.hp < 20) {
      this.logger.warning('entity', `${entity.name}이(가) 위험한 상태입니다. (HP: ${entity.hp.toFixed(1)})`, entity.id, entity.name);
    }
    
    if (entity.hunger > 80) {
      this.logger.warning('entity', `${entity.name}이(가) 매우 배고픕니다. (배고픔: ${entity.hunger.toFixed(1)})`, entity.id, entity.name);
    }
    
    return true;
  }

  private logDeath(entity: Entity, cause: string, details: any): void {
    const deathInfo = {
      cause,
      details,
      stats: {
        hp: entity.hp,
        stamina: entity.stamina,
        hunger: entity.hunger,
        age: entity.age,
        species: entity.species,
        faction: entity.factionId || '무소속'
      },
      skills: entity.skills,
      position: entity.pos
    };
    
    this.logger.error('entity', `${entity.name}이(가) ${cause}로 사망했습니다.`, entity.id, entity.name, deathInfo);
  }

  private calculateDistance(pos1: { x: number; y: number }, pos2: { x: number; y: number }): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private decideAction(entity: Entity, desires: Record<StimKey, number>, world: any): ActionType {
    // world 객체 안전성 체크
    if (!world || !world.entities) {
      return 'Rest'; // 기본 행동
    }

    // 가장 높은 욕구 찾기
    const maxDesire = Math.max(...Object.values(desires));
    const maxDesireKey = Object.keys(desires).find(key => desires[key as StimKey] === maxDesire) as StimKey;

    // 전투 확률 증가 (10% 확률)
    if (this.rng.bool(0.1)) {
      const nearbyEntities = world.entities.filter((e: Entity) => 
        e.id !== entity.id && e.hp > 0 && 
        this.calculateDistance(entity.pos, e.pos) < 30
      );
      if (nearbyEntities.length > 0) {
        return 'Combat';
      }
    }

    // 교배 확률 증가 (15% 확률)
    if (this.rng.bool(0.15) && entity.age > 20 && entity.age < 80) {
      const potentialMates = world.entities.filter((e: Entity) => 
        e.id !== entity.id && e.hp > 0 && e.age > 20 && e.age < 80 &&
        e.species === entity.species &&
        this.calculateDistance(entity.pos, e.pos) < 20
      );
      if (potentialMates.length > 0) {
        return 'Mate';
      }
    }

    // 욕구에 따른 행동 매핑
    const actionMap: Record<StimKey, ActionType[]> = {
      survival: ['Gather', 'Eat', 'Rest', 'Move'],
      reproduction: ['Mate', 'Social'],
      curiosity: ['Research', 'Explore'],
      social: ['Social', 'Trade'],
      prestige: ['Craft', 'Build'],
      fatigue: ['Rest', 'Sleep']
    };

    const possibleActions = actionMap[maxDesireKey] || ['Rest'];
    
    // 랜덤 요소 추가
    if (this.rng.bool(0.2)) { // 20% 확률로 다른 행동
      const allActions: ActionType[] = ['Gather', 'Eat', 'Rest', 'Move', 'Craft', 'Build', 'Research', 'Social', 'Trade'];
      return this.rng.pick(allActions);
    }

    return this.rng.pick(possibleActions);
  }

  private executeAction(entity: Entity, action: ActionType, world: any): void {
    let success = false;
    
    switch (action) {
      case 'Gather':
        success = this.performGather(entity, world);
        break;
      case 'Eat':
        success = this.performEat(entity, world);
        break;
      case 'Rest':
        success = this.performRest(entity);
        break;
      case 'Move':
        success = this.performMove(entity);
        break;
      case 'Craft':
        success = this.performCraft(entity, world);
        break;
      case 'Build':
        success = this.performBuild(entity, world);
        break;
      case 'Research':
        success = this.performResearch(entity, world);
        break;
      case 'Social':
        success = this.performSocial(entity, world);
        break;
      case 'Trade':
        success = this.performTrade(entity, world);
        break;
      case 'Mate':
        success = this.performMate(entity, world);
        break;
      case 'Combat':
        success = this.performCombat(entity, world);
        break;
      default:
        success = this.performRest(entity);
        break;
    }
    
    // 감정 말풍선 생성
    if (world.createActionBubble) {
      world.createActionBubble(entity, action, success);
    }
  }

  private performGather(entity: Entity, _world: any): boolean {
    if (entity.stamina < 15) return false;

    const skillBonus = entity.skills.gather / 100;
    const successRate = 0.6 + skillBonus * 0.3;
    
    if (this.rng.bool(successRate)) {
      const yieldAmount = Math.floor(this.rng.range(2, 8) * (1 + skillBonus));
      this.addItemToInventory(entity, 'food', yieldAmount);
      entity.stamina -= 10;
      entity.hunger = Math.max(0, entity.hunger - 15);
      
      this.logger.success('entity', `${entity.name}이(가) 음식을 ${yieldAmount}개 채집했습니다.`, entity.id, entity.name, { yield: yieldAmount });
      return true;
    } else {
      entity.stamina -= 5;
      this.logger.warning('entity', `${entity.name}이(가) 채집에 실패했습니다.`, entity.id, entity.name);
      return false;
    }
  }

  private performEat(entity: Entity, _world: any): boolean {
    const foodAmount = entity.inventory.items['food'] || 0;
    
    if (foodAmount > 0) {
      const consumeAmount = Math.min(5, foodAmount);
      entity.inventory.items['food'] -= consumeAmount;
      entity.hunger = Math.max(0, entity.hunger - consumeAmount * 3);
      entity.hp = Math.min(100, entity.hp + consumeAmount * 2);
      
      this.logger.info('entity', `${entity.name}이(가) 음식을 ${consumeAmount}개 먹었습니다.`, entity.id, entity.name);
      return true;
    } else {
      this.logger.warning('entity', `${entity.name}이(가) 먹을 음식이 없습니다.`, entity.id, entity.name);
      return false;
    }
  }

  private performRest(entity: Entity): boolean {
    const restAmount = 25 + entity.skills.lead * 0.1; // 리더십이 높을수록 더 효과적
    entity.stamina = Math.min(100, entity.stamina + restAmount);
    entity.hp = Math.min(100, entity.hp + 8);
    
    this.logger.info('entity', `${entity.name}이(가) 휴식을 취했습니다.`, entity.id, entity.name);
    return true;
  }

  private performMove(entity: Entity): boolean {
    if (entity.stamina < 8) return false;

    const moveDistance = 2 + entity.stats.agi * 0.05; // 민첩이 높을수록 더 멀리 이동
    const dx = this.rng.range(-moveDistance, moveDistance);
    const dy = this.rng.range(-moveDistance, moveDistance);
    
    entity.pos.x = Math.max(0, Math.min(1000, entity.pos.x + dx));
    entity.pos.y = Math.max(0, Math.min(1000, entity.pos.y + dy));
    entity.stamina -= 8;
    
    if (this.rng.bool(0.1)) {
      this.logger.info('entity', `${entity.name}이(가) 새로운 곳으로 이동했습니다.`, entity.id, entity.name, { pos: entity.pos });
    }
    return true;
  }

  private performCraft(entity: Entity, _world: any): boolean {
    if (entity.stamina < 20) return false;

    const skillBonus = entity.skills.craft / 100;
    const successRate = 0.4 + skillBonus * 0.4;
    
    if (this.rng.bool(successRate)) {
      // 간단한 제작 시스템
      const craftedItem = this.craftRandomItem(entity);
      this.addItemToInventory(entity, craftedItem, 1);
      entity.stamina -= 20;
      
      this.logger.success('entity', `${entity.name}이(가) ${craftedItem}을(를) 제작했습니다.`, entity.id, entity.name);
      return true;
    } else {
      entity.stamina -= 10;
      this.logger.warning('entity', `${entity.name}이(가) 제작에 실패했습니다.`, entity.id, entity.name);
      return false;
    }
  }

  private performBuild(entity: Entity, _world: any): boolean {
    if (entity.stamina < 25) return false;

    const skillBonus = entity.skills.build / 100;
    const successRate = 0.3 + skillBonus * 0.5;
    
    if (this.rng.bool(successRate)) {
      entity.stamina -= 25;
      this.logger.success('entity', `${entity.name}이(가) 건물을 지었습니다.`, entity.id, entity.name);
      return true;
    } else {
      entity.stamina -= 15;
      this.logger.warning('entity', `${entity.name}이(가) 건축에 실패했습니다.`, entity.id, entity.name);
      return false;
    }
  }

  private performResearch(entity: Entity, _world: any): boolean {
    if (entity.stamina < 15) return false;

    const skillBonus = entity.skills.analyze / 100;
    const successRate = 0.5 + skillBonus * 0.3;
    
    if (this.rng.bool(successRate)) {
      entity.stamina -= 15;
      this.logger.success('entity', `${entity.name}이(가) 연구를 완료했습니다.`, entity.id, entity.name);
      return true;
    } else {
      entity.stamina -= 8;
      this.logger.info('entity', `${entity.name}이(가) 연구 중입니다.`, entity.id, entity.name);
      return false;
    }
  }

  private performSocial(entity: Entity, _world: any): boolean {
    if (entity.stamina < 10) return false;

    const skillBonus = entity.skills.lead / 100;
    entity.morale = Math.min(100, entity.morale + 10 + skillBonus * 20);
    entity.stamina -= 10;
    
    this.logger.info('entity', `${entity.name}이(가) 사회 활동을 했습니다.`, entity.id, entity.name);
    return true;
  }

  private performTrade(entity: Entity, _world: any): boolean {
    if (entity.stamina < 12) return false;

    const skillBonus = entity.skills.trade / 100;
    const successRate = 0.6 + skillBonus * 0.3;
    
    if (this.rng.bool(successRate)) {
      entity.stamina -= 12;
      this.logger.success('entity', `${entity.name}이(가) 거래를 성공했습니다.`, entity.id, entity.name);
      return true;
    } else {
      entity.stamina -= 8;
      this.logger.warning('entity', `${entity.name}이(가) 거래에 실패했습니다.`, entity.id, entity.name);
      return false;
    }
  }

  private performMate(entity: Entity, world: any): boolean {
    if (entity.stamina < 20 || entity.age < 20 || entity.age > 80) return false;

    // world 객체 안전성 체크
    if (!world || !world.entities) return false;

    // 근처의 같은 종족 엔티티 찾기
    const potentialMates = world.entities.filter((e: Entity) => 
      e.id !== entity.id && e.hp > 0 && e.age > 20 && e.age < 80 &&
      e.species === entity.species &&
      this.calculateDistance(entity.pos, e.pos) < 20
    );

    if (potentialMates.length === 0) return false;

    const mate = this.rng.pick(potentialMates) as Entity;
    const compatibility = this.calculateCompatibility(entity, mate);
    
    if (compatibility > 0.5 && this.rng.bool(0.7)) {
      // 자식 생성
      if (world.createChild) {
        const childPos = {
          x: (entity.pos.x + mate.pos.x) / 2,
          y: (entity.pos.y + mate.pos.y) / 2
        };
        const child = world.createChild(entity, mate, childPos);
        world.entities.push(child);
        
        this.logger.success('genetics', `${entity.name}과(와) ${mate.name}이(가) 교배하여 자식을 낳았습니다.`, entity.id, entity.name);
        return true;
      }
    }

    entity.stamina -= 10;
    this.logger.warning('entity', `${entity.name}이(가) 교배에 실패했습니다.`, entity.id, entity.name);
    return false;
  }

  private performCombat(entity: Entity, world: any): boolean {
    if (entity.stamina < 20) return false;

    // world 객체 안전성 체크
    if (!world || !world.entities) return false;

    // 근처의 적대적 엔티티 찾기
    const nearbyEntities = world.entities.filter((e: Entity) => 
      e.id !== entity.id && e.hp > 0 && 
      this.calculateDistance(entity.pos, e.pos) < 30
    );

    if (nearbyEntities.length === 0) return false;

    const target = this.rng.pick(nearbyEntities) as Entity;
    
    // 전투 시스템 사용
    if (world.combatSystem) {
      const result = world.combatSystem.executeCombat(entity, target);
      if (result) {
        this.logger.success('combat', `${entity.name}이(가) ${target.name}을(를) 공격했습니다. (데미지: ${result.damage})`, entity.id, entity.name);
        return true;
      }
    }

    entity.stamina -= 10;
    this.logger.warning('combat', `${entity.name}이(가) 전투에 실패했습니다.`, entity.id, entity.name);
    return false;
  }

  private calculateCompatibility(entity1: Entity, entity2: Entity): number {
    // 유전적 호환성 계산
    const geneCompatibility = Object.keys(entity1.genes).reduce((sum, key) => {
      const geneKey = key as keyof typeof entity1.genes;
      const diff = Math.abs(entity1.genes[geneKey] - entity2.genes[geneKey]);
      return sum + (1 - diff);
    }, 0) / Object.keys(entity1.genes).length;

    // 나이 호환성
    const ageDiff = Math.abs(entity1.age - entity2.age);
    const ageCompatibility = Math.max(0, 1 - ageDiff / 50);

    return (geneCompatibility + ageCompatibility) / 2;
  }

  private craftRandomItem(_entity: Entity): string {
    const items = ['도구', '무기', '방어구', '장식품', '도구'];
    return this.rng.pick(items);
  }

  private addItemToInventory(entity: Entity, itemId: string, amount: number): void {
    entity.inventory.items[itemId] = (entity.inventory.items[itemId] || 0) + amount;
  }

  private updateLearning(entity: Entity, action: ActionType, stim: Record<StimKey, number>): void {
    // 행동에 따른 학습 업데이트
    const learningRate = 0.01;
    
    switch (action) {
      case 'Gather':
        entity.skills.gather = Math.min(100, entity.skills.gather + learningRate * 10);
        break;
      case 'Craft':
        entity.skills.craft = Math.min(100, entity.skills.craft + learningRate * 10);
        break;
      case 'Build':
        entity.skills.build = Math.min(100, entity.skills.build + learningRate * 10);
        break;
      case 'Research':
        entity.skills.analyze = Math.min(100, entity.skills.analyze + learningRate * 10);
        break;
      case 'Social':
        entity.skills.lead = Math.min(100, entity.skills.lead + learningRate * 10);
        break;
      case 'Trade':
        entity.skills.trade = Math.min(100, entity.skills.trade + learningRate * 10);
        break;
    }

    // 경험에 따른 성향 변화
    for (const key of Object.keys(stim) as StimKey[]) {
      const change = this.rng.range(-0.01, 0.01);
      entity.epi[key] = Math.max(-0.5, Math.min(0.5, entity.epi[key] + change));
    }

    // 학습 경험 획득 (월드 시스템에서 처리)
    // this.world.learnFromExperience(entity, action, true, 1);
  }
} 