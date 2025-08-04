import { Entity, StimKey, ActionType } from '../types';
import { RNG, calculateStim, calculateDesire } from './utils';
import { Logger } from './utils/logger';
import { parameterManager } from '../parameters';


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
    // 기본 감소 - 파라미터 사용
    const staminaDecreaseRate = parameterManager.getParameter('entity', 'staminaDecreaseRate');
    const hungerIncreaseRate = parameterManager.getParameter('entity', 'hungerIncreaseRate');
    const ageIncreaseRate = parameterManager.getParameter('entity', 'ageIncreaseRate');
    const hpRegenRate = parameterManager.getParameter('entity', 'hpRegenRate');
    
    entity.stamina = Math.max(0, entity.stamina - staminaDecreaseRate);
    entity.hunger = Math.min(100, entity.hunger + hungerIncreaseRate);
    entity.age += ageIncreaseRate;
    
    // HP 자연 회복/감소
    if (entity.stamina > 50) {
      entity.hp = Math.min(100, entity.hp + hpRegenRate);
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

    // 전투 확률 증가 (배고픔이 높을 때 더 적극적으로) - 파라미터 사용
    const hungerFactor = entity.hunger / 100;
    const combatBaseChance = parameterManager.getParameter('entity', 'combatBaseChance');
    const combatHungerFactor = parameterManager.getParameter('entity', 'combatHungerFactor');
    const combatChance = combatBaseChance + hungerFactor * combatHungerFactor;
    if (this.rng.bool(combatChance)) {
      const nearbyEntities = world.entities.filter((e: Entity) => 
        e.id !== entity.id && e.hp > 0 && 
        this.calculateDistance(entity.pos, e.pos) < 30 &&
        e.species !== 'human' // 인간은 인간을 사냥하지 않음
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
      survival: ['Gather', 'Eat', 'Combat', 'Rest', 'Move'], // Combat 추가
      reproduction: ['Mate', 'Social'],
      curiosity: ['Research', 'Explore', 'Craft'], // Craft 추가 (재료 실험)
      social: ['Social', 'Trade'],
      prestige: ['Craft', 'Build', 'Research'], // Research 추가
      fatigue: ['Rest', 'Sleep']
    };

    const possibleActions = actionMap[maxDesireKey] || ['Rest'];
    
    // survival 욕구가 높을 때 Gather 우선 - 파라미터 사용
    if (maxDesireKey === 'survival' && desires.survival > 0.5) {
      // 배고픔이 높으면 Eat 우선, 그 다음 Gather
      const eatHungerThreshold = parameterManager.getParameter('entity', 'eatHungerThreshold');
      const eatPriorityChance = parameterManager.getParameter('entity', 'eatPriorityChance');
      const gatherPriorityChance = parameterManager.getParameter('entity', 'gatherPriorityChance');
      
      if (entity.hunger > eatHungerThreshold) {
        if (this.rng.bool(eatPriorityChance)) {
          return 'Eat';
        }
      } else {
        if (this.rng.bool(gatherPriorityChance)) {
          return 'Gather';
        }
      }
    }
    
    // curiosity 욕구가 높을 때 Research 우선 - 파라미터 사용
    const curiosityThreshold = parameterManager.getParameter('entity', 'curiosityThreshold');
    const curiosityResearchChance = parameterManager.getParameter('entity', 'curiosityResearchChance');
    if (maxDesireKey === 'curiosity' && desires.curiosity > curiosityThreshold) {
      if (this.rng.bool(curiosityResearchChance)) {
        return 'Research';
      }
    }
    
    // 랜덤 요소 추가 - 파라미터 사용
    const randomActionChance = parameterManager.getParameter('entity', 'randomActionChance');
    if (this.rng.bool(randomActionChance)) {
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

  private performGather(entity: Entity, world: any): boolean {
    if (entity.stamina < 15) return false;

    // 실제 식물과 상호작용
    if (world && world.plants) {
      const nearbyPlants = world.plants.filter((plant: any) => 
        !plant.isDead && this.calculateDistance(entity.pos, plant.pos) < 15
      );

      if (nearbyPlants.length > 0) {
        // 가장 가까운 식물 선택
        const closestPlant = nearbyPlants.reduce((closest: any, plant: any) => {
          const closestDist = this.calculateDistance(entity.pos, closest.pos);
          const plantDist = this.calculateDistance(entity.pos, plant.pos);
          return plantDist < closestDist ? plant : closest;
        });

        const skillBonus = entity.skills.gather / 100;
        const successRate = 0.7 + skillBonus * 0.2; // 성공률 증가
        
        if (this.rng.bool(successRate)) {
          const yieldAmount = Math.floor(this.rng.range(3, 10) * (1 + skillBonus)); // 수확량 증가
          this.addItemToInventory(entity, 'food', yieldAmount);
          entity.stamina -= 8; // 스태미나 소모 감소
          entity.hunger = Math.max(0, entity.hunger - 20); // 배고픔 감소 증가
          
          // 식물 HP 감소 (완전히 소비하지 않음)
          closestPlant.hp = Math.max(0, closestPlant.hp - 5);
          
          this.logger.success('entity', `${entity.name}이(가) ${closestPlant.species}에서 음식을 ${yieldAmount}개 채집했습니다.`, entity.id, entity.name, { 
            yield: yieldAmount, 
            plantSpecies: closestPlant.species,
            plantHp: closestPlant.hp 
          });
          return true;
        } else {
          entity.stamina -= 3; // 실패 시 스태미나 소모 감소
          this.logger.warning('entity', `${entity.name}이(가) 채집에 실패했습니다.`, entity.id, entity.name);
          return false;
        }
      }
    }

    // 기존 랜덤 채집 (식물이 없을 때)
    const skillBonus = entity.skills.gather / 100;
    const successRate = 0.5 + skillBonus * 0.3;
    
    if (this.rng.bool(successRate)) {
      const yieldAmount = Math.floor(this.rng.range(1, 5) * (1 + skillBonus));
      this.addItemToInventory(entity, 'food', yieldAmount);
      entity.stamina -= 10;
      entity.hunger = Math.max(0, entity.hunger - 10);
      
      this.logger.info('entity', `${entity.name}이(가) 땅에서 음식을 ${yieldAmount}개 채집했습니다.`, entity.id, entity.name, { yield: yieldAmount });
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

  private performCraft(entity: Entity, world: any): boolean {
    const craftStaminaCost = parameterManager.getParameter('entity', 'craftStaminaCost');
    const craftFailStaminaCost = parameterManager.getParameter('entity', 'craftFailStaminaCost');
    const craftBaseSuccessRate = parameterManager.getParameter('entity', 'craftBaseSuccessRate');
    const craftSkillBonus = parameterManager.getParameter('entity', 'craftSkillBonus');
    const craftMaterialDiscoveryChance = parameterManager.getParameter('entity', 'craftMaterialDiscoveryChance');
    const craftSkillGain = parameterManager.getParameter('entity', 'craftSkillGain');
    const craftNormalSkillGain = parameterManager.getParameter('entity', 'craftNormalSkillGain');
    
    if (entity.stamina < craftStaminaCost) return false;

    const skillBonus = entity.skills.craft / 100;
    const successRate = craftBaseSuccessRate + skillBonus * craftSkillBonus;
    
    if (this.rng.bool(successRate)) {
      entity.stamina -= craftStaminaCost;
      
      // 제작 중 재료 발견 시도 (제작 스킬이 높을수록 확률 증가)
      const materialDiscoveryChance = Math.min(craftMaterialDiscoveryChance, entity.skills.craft / 200);
      
      if (this.rng.bool(materialDiscoveryChance)) {
        // 새로운 재료 발견
        const newMaterial = world.materialSystem.attemptResearchBasedCombination(entity);
        if (newMaterial) {
          this.logger.success('material', `${entity.name}이(가) 제작 과정에서 새로운 재료 "${newMaterial.name}"을(를) 발견했습니다!`, entity.id, entity.name, { 
            materialName: newMaterial.name,
            tier: newMaterial.tier,
            skillUsed: entity.skills.craft
          });
          
          // 제작 스킬 향상
          entity.skills.craft = Math.min(100, entity.skills.craft + craftSkillGain);
          return true;
        }
      }
      
      // 일반 제작 성공
      const craftedItem = this.craftRandomItem(entity);
      this.addItemToInventory(entity, craftedItem, 1);
      
      this.logger.success('entity', `${entity.name}이(가) ${craftedItem}을(를) 제작했습니다.`, entity.id, entity.name);
      entity.skills.craft = Math.min(100, entity.skills.craft + craftNormalSkillGain);
      return true;
    } else {
      entity.stamina -= craftFailStaminaCost;
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

  private performResearch(entity: Entity, world: any): boolean {
    const researchStaminaCost = parameterManager.getParameter('entity', 'researchStaminaCost');
    const researchFailStaminaCost = parameterManager.getParameter('entity', 'researchFailStaminaCost');
    const researchBaseSuccessRate = parameterManager.getParameter('entity', 'researchBaseSuccessRate');
    const researchSkillBonus = parameterManager.getParameter('entity', 'researchSkillBonus');
    const researchMaterialDiscoveryChance = parameterManager.getParameter('entity', 'researchMaterialDiscoveryChance');
    const researchSkillGain = parameterManager.getParameter('entity', 'researchSkillGain');
    const researchNormalSkillGain = parameterManager.getParameter('entity', 'researchNormalSkillGain');
    
    if (entity.stamina < researchStaminaCost) return false;

    const skillBonus = entity.skills.analyze / 100;
    const successRate = researchBaseSuccessRate + skillBonus * researchSkillBonus;
    
    if (this.rng.bool(successRate)) {
      entity.stamina -= researchStaminaCost;
      
      // 재료 발견 시도 (분석 스킬이 높을수록 확률 증가)
      const materialDiscoveryChance = Math.min(researchMaterialDiscoveryChance, entity.skills.analyze / 150);
      
      if (this.rng.bool(materialDiscoveryChance)) {
        // 새로운 재료 발견
        const newMaterial = world.materialSystem.attemptResearchBasedCombination(entity);
        if (newMaterial) {
          this.logger.success('research', `${entity.name}이(가) 연구를 통해 새로운 재료 "${newMaterial.name}"을(를) 발견했습니다!`, entity.id, entity.name, { 
            materialName: newMaterial.name,
            tier: newMaterial.tier,
            skillUsed: entity.skills.analyze
          });
          
          // 분석 스킬 향상
          entity.skills.analyze = Math.min(100, entity.skills.analyze + researchSkillGain);
          return true;
        }
      }
      
      // 일반 연구 성공
      this.logger.success('research', `${entity.name}이(가) 연구를 완료했습니다.`, entity.id, entity.name);
      entity.skills.analyze = Math.min(100, entity.skills.analyze + researchNormalSkillGain);
      return true;
    } else {
      entity.stamina -= researchFailStaminaCost;
      this.logger.info('research', `${entity.name}이(가) 연구 중입니다.`, entity.id, entity.name);
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

    // 근처의 동물이나 다른 엔티티 찾기 (사냥 대상)
    const nearbyTargets = world.entities.filter((e: Entity) => 
      e.id !== entity.id && e.hp > 0 && 
      this.calculateDistance(entity.pos, e.pos) < 30 &&
      e.species !== 'human' // 인간은 인간을 사냥하지 않음
    );

    if (nearbyTargets.length === 0) return false;

    const target = this.rng.pick(nearbyTargets) as Entity;
    
    // 생태계 시스템을 통한 사냥 처리
    if (world.ecosystemSystem) {
      // 생태계의 포식 처리 사용
      world.ecosystemSystem.handlePredation(entity, target);
      
      // 사냥 성공 여부 확인 (타겟이 죽었는지)
      if (target.hp <= 0) {
        this.logger.success('hunting', `${entity.name}이(가) ${target.name}을(를) 사냥했습니다!`, entity.id, entity.name);
        return true;
      } else {
        this.logger.warning('hunting', `${entity.name}이(가) ${target.name} 사냥에 실패했습니다.`, entity.id, entity.name);
        entity.stamina -= 8;
        return false;
      }
    }
    
    // 기존 전투 시스템 (fallback)
    if (world.combatSystem) {
      const result = world.combatSystem.executeCombat(entity, target);
      if (result) {
        this.logger.success('hunting', `${entity.name}이(가) ${target.name}을(를) 공격했습니다. (데미지: ${result.damage})`, entity.id, entity.name);
        return true;
      }
    }

    entity.stamina -= 8;
    this.logger.warning('hunting', `${entity.name}이(가) 전투에 실패했습니다.`, entity.id, entity.name);
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