import { Entity, StimKey, ActionType } from '../types';
import { RNG, calculateStim, calculateDesire } from './utils';
import { Logger } from './utils/logger';
import { CombatSystem } from './combat';

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
    // 사망 조건
    if (entity.hp <= 0 || entity.hunger >= 100 || entity.age >= 100) {
      // 사망 로그
      this.logger.warning('entity', `${entity.name}이(가) 사망했습니다. (HP: ${entity.hp.toFixed(1)}, 배고픔: ${entity.hunger.toFixed(1)}, 나이: ${entity.age.toFixed(1)})`, entity.id, entity.name);
      return false;
    }
    return true;
  }

  private decideAction(_entity: Entity, desires: Record<StimKey, number>, _world: any): ActionType {
    // 가장 높은 욕구 찾기
    const maxDesire = Math.max(...Object.values(desires));
    const maxDesireKey = Object.keys(desires).find(key => desires[key as StimKey] === maxDesire) as StimKey;

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

  private performMate(entity: Entity, _world: any): boolean {
    if (entity.stamina < 30 || entity.age < 20) return false;

    const skillBonus = entity.skills.lead / 100;
    const successRate = 0.3 + skillBonus * 0.4;
    
    if (this.rng.bool(successRate)) {
      entity.stamina -= 30;
      this.logger.success('entity', `${entity.name}이(가) 번식 활동을 했습니다.`, entity.id, entity.name);
      return true;
    } else {
      entity.stamina -= 15;
      this.logger.info('entity', `${entity.name}이(가) 번식 시도를 했습니다.`, entity.id, entity.name);
      return false;
    }
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