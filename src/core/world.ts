import { WorldState, Entity, Vec2, Animal, Plant } from '../types';
import { RNG, uuid } from './utils';
import { Logger } from './utils/logger';
import { NameGenerator } from './utils/nameGenerator';
import { MaterialSystem } from './material';
import { EntitySystem } from './entity';
import { FactionSystem } from './faction';
import { GeneticsSystem } from './genetics';
import { LearningSystem } from './learning';
import { EcosystemSystem } from './ecosystem';
import { EmotionSystem } from './emotion';
import { parameterManager } from '../parameters';

export class World {
  private state: WorldState;
  private rng: RNG;
  private logger: Logger;
  private nameGenerator: NameGenerator;
  private materialSystem: MaterialSystem;
  private entitySystem: EntitySystem;
  private factionSystem: FactionSystem;
  private geneticsSystem: GeneticsSystem;
  private learningSystem: LearningSystem;
  private ecosystemSystem: EcosystemSystem;
  private emotionSystem: EmotionSystem;

  constructor() {
    this.rng = new RNG();
    this.logger = new Logger();
    this.nameGenerator = new NameGenerator();
    this.materialSystem = new MaterialSystem(this.logger);
    this.entitySystem = new EntitySystem(this.logger);
    this.factionSystem = new FactionSystem(this.logger);
    this.geneticsSystem = new GeneticsSystem(this.logger);
    this.learningSystem = new LearningSystem(this.logger);
    this.ecosystemSystem = new EcosystemSystem(this.logger);
    this.emotionSystem = new EmotionSystem();
    this.state = {
      entities: [],
      materials: [],
      buildings: [],
      tools: [],
      equipment: [],
      knowledgeItems: [],
      logs: [],
      factions: [],
      factionRelations: [],
      animals: [],
      plants: [],
      pulses: [],
      biomes: [],
      emotionBubbles: [],
      tick: 0,
      time: 0
    };
  }

  getState(): WorldState {
    return { 
      ...this.state,
      materials: this.materialSystem.getMaterials(),
      logs: this.logger.getLogs(),
      factions: this.factionSystem.getAllFactions(),
      factionRelations: Array.from(this.factionSystem['relations'].values()),
      animals: this.ecosystemSystem.getAnimals(),
      plants: this.ecosystemSystem.getPlants(),
      pulses: this.ecosystemSystem.getPulses(),
      biomes: this.ecosystemSystem.getBiomes(),
      emotionBubbles: this.emotionSystem.getBubbles()
    };
  }

  loadState(savedState: WorldState): void {
    // 전체 상태를 저장된 상태로 복원
    this.state = savedState;
  }

  tick(): void {
    this.state.tick++;
    this.state.time += 100; // 100ms per tick

    // 엔티티 업데이트 및 사망 체크
    const deadEntities: string[] = [];
    for (const entity of this.state.entities) {
      this.updateEntity(entity);
      
      // 사망 체크 (EntitySystem에서 이미 처리됨)
      if (entity.hp <= 0 || entity.hunger >= 100 || entity.age >= 100) {
        deadEntities.push(entity.id);
      }
    }

    // 사망한 엔티티 제거
    for (const deadId of deadEntities) {
      this.removeEntity(deadId);
    }

    // 자동 재료 조합 제거 - 이제 엔티티의 연구를 통해서만 재료 발견

    // 파벌 시스템 업데이트
    this.factionSystem.updateFactions(this);

    // 학습 시스템 업데이트
    this.learningSystem.updateTeaching();
    this.learningSystem.updateLearningModifiers();

    // 생태계 시스템 업데이트 (인간 엔티티 포함)
    this.ecosystemSystem.updateEcosystemWithHumans(this.state.entities);

    // 감정 시스템 업데이트
    this.emotionSystem.updateBubbles();

    // 파벌 간 전투 시도 (5% 확률로 증가)
    if (this.rng.bool(0.05)) {
      const warResult = this.attemptFactionWar();
      if (warResult) {
        this.logger.info('faction', `파벌 전쟁이 발생했습니다: ${warResult}`, '', '');
      }
    }

    // 가르치기 시도 (0.5% 확률)
    if (this.rng.bool(0.005)) {
      this.attemptTeaching();
    }

    // 동물 생성 시도 (확률 대폭 증가)
    if (this.rng.bool(0.05)) { // 1% → 5%로 증가
      this.attemptAnimalSpawn();
    }

    // 식물 생성 시도 (확률 증가)
    if (this.rng.bool(0.03)) { // 0.5% → 3%로 증가
      this.attemptPlantSpawn();
    }

    // 감정 말풍선은 상호작용 시에만 생성 (자동 생성 제거)

    // 성능 조정
    if (this.state.entities.length > 8000) {
      // tick 간격 자동 조정
      console.log('Performance adjustment: too many entities');
    }
  }

  private updateEntity(entity: Entity): void {
    // 새로운 엔티티 시스템 사용
    this.entitySystem.updateEntity(entity, this);
  }





  // 엔티티 생성
  spawnEntity(species: Entity['species'], pos: Vec2): Entity {
    // 파라미터에서 기본값 가져오기
    const initialHp = parameterManager.getParameter('entity', 'initialHp');
    const initialStamina = parameterManager.getParameter('entity', 'initialStamina');
    const initialHunger = parameterManager.getParameter('entity', 'initialHunger');
    const initialMorale = parameterManager.getParameter('entity', 'initialMorale');
    const initialInventoryCapacity = parameterManager.getParameter('entity', 'initialInventoryCapacity');
    const minStat = parameterManager.getParameter('entity', 'minStat');
    const maxStat = parameterManager.getParameter('entity', 'maxStat');
    const minSkill = parameterManager.getParameter('entity', 'minSkill');
    const maxSkill = parameterManager.getParameter('entity', 'maxSkill');
    
    const entity: Entity = {
      id: uuid(),
      name: this.nameGenerator.generateSpeciesName(species),
      species,
      stats: {
        str: this.rng.range(minStat, maxStat),
        agi: this.rng.range(minStat, maxStat),
        end: this.rng.range(minStat, maxStat),
        int: this.rng.range(minStat, maxStat),
        per: this.rng.range(minStat, maxStat),
        cha: this.rng.range(minStat, maxStat)
      },
      genes: {
        survival: this.rng.range(0.2, 0.8),
        reproduction: this.rng.range(0.1, 0.7),
        curiosity: this.rng.range(0.1, 0.9), // 호기심 범위 확대
        social: this.rng.range(0.1, 0.7),
        prestige: this.rng.range(0.1, 0.8), // 명예욕 범위 확대
        fatigue: this.rng.range(0.1, 0.7)
      },
      epi: {
        survival: 0,
        reproduction: 0,
        curiosity: 0,
        social: 0,
        prestige: 0,
        fatigue: 0
      },
      skills: {
        gather: this.rng.range(minSkill, maxSkill),
        analyze: this.rng.range(minSkill, maxSkill), // 분석 스킬 범위 확대
        craft: this.rng.range(minSkill, maxSkill), // 제작 스킬 범위 확대
        build: this.rng.range(minSkill, maxSkill),
        cook: this.rng.range(minSkill, maxSkill),
        combat: this.rng.range(minSkill, maxSkill),
        trade: this.rng.range(minSkill, maxSkill),
        lead: this.rng.range(minSkill, maxSkill)
      },
      knowledge: {},
      hp: initialHp,
      stamina: initialStamina,
      hunger: initialHunger,
      morale: initialMorale,
      pos,
      age: 0,
      inventory: {
        items: {},
        maxCapacity: initialInventoryCapacity
      }
    };

    this.state.entities.push(entity);
    
    // 엔티티 생성 로그
    const creationInfo = {
      species: entity.species,
      position: entity.pos,
      stats: entity.stats,
      skills: entity.skills,
      genes: entity.genes,
      faction: entity.factionId || '무소속'
    };
    
    this.logger.success('entity', `${entity.name}이(가) 탄생했습니다. (종족: ${entity.species})`, entity.id, entity.name, creationInfo);
    
    // 디버깅용 로그
    console.log(`엔티티 생성됨: ${entity.name}, 현재 총 엔티티 수: ${this.state.entities.length}`);
    
    return entity;
  }

  // 초기 월드 생성
  generatePrimitives(count: number): void {
    console.log('generatePrimitives 호출됨, 요청된 엔티티 수:', count);
    
    // 초기 엔티티들
    for (let i = 0; i < count; i++) {
      const pos: Vec2 = {
        x: this.rng.range(0, 1000),
        y: this.rng.range(0, 1000)
      };
      this.spawnEntity('human', pos);
    }

    // 초기 동물들 생성 (먹잇감) - 파라미터 시스템 사용
    const animalCountRatio = parameterManager.getParameter('world', 'initialAnimalCountRatio');
    const animalCount = Math.max(20, Math.floor(count * animalCountRatio));
    for (let i = 0; i < animalCount; i++) {
      const pos: Vec2 = {
        x: this.rng.range(0, 1000),
        y: this.rng.range(0, 1000)
      };
      
      // 약한 동물들 위주로 생성 (토끼 80%, 사슴 20%)
      const species = this.rng.bool(0.8) ? 'rabbit' : 'deer';
      this.createAnimal(species, pos);
    }

    // 초기 식물들 생성 (먹을거) - 파라미터 시스템 사용
    const plantCountRatio = parameterManager.getParameter('world', 'initialPlantCountRatio');
    const plantCount = Math.max(40, Math.floor(count * plantCountRatio));
    for (let i = 0; i < plantCount; i++) {
      const pos: Vec2 = {
        x: this.rng.range(0, 1000),
        y: this.rng.range(0, 1000)
      };
      
      // 다양한 식물 생성 (풀 60%, 꽃 30%, 덤불 10%)
      const rand = this.rng.range(0, 1);
      let species: Plant['species'];
      if (rand < 0.6) {
        species = 'grass';
      } else if (rand < 0.9) {
        species = 'flower';
      } else {
        species = 'bush';
      }
      this.createPlant(species, pos);
    }

    // 초기 파벌 생성
    this.createInitialFactions();

    // 초기 로그 추가
    this.logger.info('system', 'EdenForge 시뮬레이션이 시작되었습니다.');
    this.logger.info('system', `${count}명의 엔티티가 생성되었습니다.`);
    this.logger.info('system', `${animalCount}마리의 동물이 생성되었습니다.`);
    this.logger.info('system', `${plantCount}개의 식물이 생성되었습니다.`);
    
    // 실제 생성된 엔티티 수 확인
    console.log('실제 생성된 엔티티 수:', this.state.entities.length);
    console.log('실제 생성된 동물 수:', this.ecosystemSystem.getAnimals().length);
    console.log('실제 생성된 식물 수:', this.ecosystemSystem.getPlants().length);
  }

  // 초기 파벌 생성
  private createInitialFactions(): void {
    // 엔티티들을 그룹으로 나누어 파벌 생성
    const entities = this.state.entities;
    const initialFactionCount = Math.min(4, Math.ceil(entities.length / 3));
    
    for (let i = 0; i < initialFactionCount; i++) {
      const startIndex = i * Math.ceil(entities.length / initialFactionCount);
      const endIndex = Math.min(startIndex + Math.ceil(entities.length / initialFactionCount), entities.length);
      const groupEntities = entities.slice(startIndex, endIndex);
      
      if (groupEntities.length > 0) {
        const leader = groupEntities[0];
        const faction = this.factionSystem.createRandomFaction(leader);
        
        // 나머지 엔티티들을 파벌에 추가
        for (let j = 1; j < groupEntities.length; j++) {
          this.factionSystem.addMemberToFaction(faction.id, groupEntities[j]);
        }
      }
    }
  }

  // 엔티티 제거
  removeEntity(entityId: string): void {
    const entity = this.findEntity(entityId);
    if (entity) {
      // 파벌에서 엔티티 제거
      if (entity.factionId) {
        this.factionSystem.removeMemberFromFaction(entity.factionId, entity);
      }
      
      // 엔티티 제거 로그
      const removalInfo = {
        species: entity.species,
        age: entity.age,
        cause: '사망',
        lastPosition: entity.pos,
        faction: entity.factionId || '무소속',
        finalStats: {
          hp: entity.hp,
          stamina: entity.stamina,
          hunger: entity.hunger,
          morale: entity.morale
        }
      };
      
      this.logger.warning('entity', `${entity.name}이(가) 시뮬레이션에서 제거되었습니다.`, entity.id, entity.name, removalInfo);
    }
    
    this.state.entities = this.state.entities.filter(e => e.id !== entityId);
  }

  // 엔티티 찾기
  findEntity(id: string): Entity | undefined {
    return this.state.entities.find(e => e.id === id);
  }

  // 엔티티 수
  getEntityCount(): number {
    return this.state.entities.length;
  }

  // 파벌 전투 시도
  private attemptFactionWar(): string | null {
    const factions = this.factionSystem.getAllFactions();
    if (factions.length < 2) return null;

    // 랜덤하게 두 파벌 선택
    const attacker = this.rng.pick(factions);
    const defender = this.rng.pick(factions.filter(f => f.id !== attacker.id));
    
    if (!attacker || !defender) return null;

    // 전투 조건 체크
    const relation = this.factionSystem.getFactionRelation(attacker.id, defender.id);
    if (relation && relation.value > -30) return null; // 관계가 너무 좋으면 전투 안함

    // 전투 실행
    this.factionSystem.initiateFactionWar(attacker, defender);
    return `${attacker.name} vs ${defender.name}`;
  }

  // 파벌 생성
  createFaction(name: string, leader: Entity, color: string): void {
    this.factionSystem.createFaction(name, leader, color);
  }

  // 파벌에 멤버 추가
  addEntityToFaction(factionId: string, entity: Entity): boolean {
    return this.factionSystem.addMemberToFaction(factionId, entity);
  }

  // 가르치기 시도
  private attemptTeaching(): void {
    const entities = this.state.entities.filter(e => e.hp > 0 && e.stamina > 20);
    if (entities.length < 2) return;

    // 랜덤하게 교사와 학생 선택
    const teacher = this.rng.pick(entities);
    const student = this.rng.pick(entities.filter(e => e.id !== teacher.id));
    
    if (!teacher || !student) return;

    // 가르칠 수 있는 스킬 선택
    const availableSkills = Object.entries(teacher.skills)
      .filter(([_, level]) => level > 30)
      .map(([skill, _]) => skill);

    if (availableSkills.length === 0) return;

    const subject = this.rng.pick(availableSkills);
    
    // 가르치기 시작
    this.learningSystem.startTeaching(teacher, student, subject);
  }

  // 자식 생성
  createChild(parent1: Entity, parent2: Entity, pos: Vec2): Entity {
    return this.geneticsSystem.createChild(parent1, parent2, pos);
  }

  // 유전 적합성 계산
  calculateGeneticCompatibility(entity1: Entity, entity2: Entity): number {
    return this.geneticsSystem.calculateGeneticCompatibility(entity1, entity2);
  }

  // 유전 특성 획득
  acquireGeneticTrait(entity: Entity, traitId: string): boolean {
    return this.geneticsSystem.acquireTrait(entity, traitId);
  }

  // 학습 경험 획득
  learnFromExperience(entity: Entity, action: string, success: boolean, intensity: number = 1): void {
    this.learningSystem.learnFromExperience(entity, action, success, intensity);
  }

  // 동물 생성 시도
  private attemptAnimalSpawn(): void {
    // 약한 동물들 위주로 생성 (토끼 60%, 사슴 30%, 기타 10%)
    let species: Animal['species'];
    const rand = this.rng.range(0, 1);
    if (rand < 0.6) {
      species = 'rabbit';
    } else if (rand < 0.9) {
      species = 'deer';
    } else {
      species = this.rng.pick(['wolf', 'bear', 'fox']);
    }
    
    const pos: Vec2 = {
      x: this.rng.range(0, 1000),
      y: this.rng.range(0, 1000)
    };
    
    this.ecosystemSystem.createAnimal(species, pos);
  }

  // 식물 생성 시도
  private attemptPlantSpawn(): void {
    // 다양한 식물 생성 (풀 40%, 꽃 30%, 덤불 20%, 나무 10%)
    let species: Plant['species'];
    const rand = this.rng.range(0, 1);
    if (rand < 0.4) {
      species = 'grass';
    } else if (rand < 0.7) {
      species = 'flower';
    } else if (rand < 0.9) {
      species = 'bush';
    } else {
      species = 'tree';
    }
    
    const pos: Vec2 = {
      x: this.rng.range(0, 1000),
      y: this.rng.range(0, 1000)
    };
    
    this.ecosystemSystem.createPlant(species, pos);
  }

  // 동물 생성
  createAnimal(species: Animal['species'], pos: Vec2): Animal {
    const animal = this.ecosystemSystem.createAnimal(species, pos);
    animal.name = this.nameGenerator.generateSpeciesName(species);
    return animal;
  }

  // 식물 생성
  createPlant(species: Plant['species'], pos: Vec2): Plant {
    const plant = this.ecosystemSystem.createPlant(species, pos);
    plant.name = this.nameGenerator.generateSpeciesName(species);
    return plant;
  }

  // Pulse 영향 계산
  calculatePulseInfluence(pos: Vec2): { fear: number; danger: number; attraction: number; food: number } {
    return this.ecosystemSystem.calculatePulseInfluence(pos);
  }

  // 상호작용 감정 말풍선 생성
  createInteractionBubble(entity: Entity, interactionType: 'combat' | 'social' | 'trade' | 'mate'): void {
    const bubble = this.emotionSystem.createEmotionBubble(entity, interactionType);
    if (bubble) {
      this.logger.info('emotion', `${entity.name}의 상호작용: ${bubble.message}`, entity.id, entity.name);
    }
  }

  // 행동 말풍선 생성
  createActionBubble(entity: Entity, action: string, success: boolean): void {
    const bubble = this.emotionSystem.createActionBubble(entity, action, success);
    if (bubble) {
      this.logger.info('emotion', `${entity.name}의 행동: ${bubble.message}`, entity.id, entity.name);
    }
  }

  // 생각 말풍선 생성
  createThoughtBubble(entity: Entity, thought: string): void {
    const bubble = this.emotionSystem.createThoughtBubble(entity, thought);
    this.logger.info('emotion', `${entity.name}의 생각: ${bubble.message}`, entity.id, entity.name);
  }

  // 대화 말풍선 생성
  createSpeechBubble(entity: Entity, targetEntity: Entity, topic: string): void {
    const bubble = this.emotionSystem.createSpeechBubble(entity, targetEntity, topic);
    this.logger.info('emotion', `${entity.name}의 대화: ${bubble.message}`, entity.id, entity.name);
  }
} 