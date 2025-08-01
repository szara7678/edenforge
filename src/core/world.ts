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

  tick(): void {
    this.state.tick++;
    this.state.time += 100; // 100ms per tick

    // 엔티티 업데이트 및 사망 체크
    const deadEntities: string[] = [];
    for (const entity of this.state.entities) {
      this.updateEntity(entity);
      
      // 사망 체크
      if (entity.hp <= 0 || entity.hunger >= 100 || entity.age >= 100) {
        deadEntities.push(entity.id);
      }
    }

    // 사망한 엔티티 제거
    for (const deadId of deadEntities) {
      const deadEntity = this.findEntity(deadId);
      if (deadEntity) {
        this.logger.info('entity', `${deadEntity.name}이(가) 사망했습니다.`, deadEntity.id, deadEntity.name);
      }
      this.removeEntity(deadId);
    }

    // 가끔 재료 조합 시도 (5% 확률)
    if (this.rng.bool(0.05)) {
      const newMaterial = this.materialSystem.attemptRandomCombination();
      if (newMaterial) {
        this.logger.info('material', `새로운 재료 "${newMaterial.name}"이(가) 발견되었습니다!`, newMaterial.id, newMaterial.name);
      }
    }

    // 파벌 시스템 업데이트
    this.factionSystem.updateFactions(this);

    // 학습 시스템 업데이트
    this.learningSystem.updateTeaching();
    this.learningSystem.updateLearningModifiers();

    // 생태계 시스템 업데이트 (인간 엔티티 포함)
    this.ecosystemSystem.updateEcosystemWithHumans(this.state.entities);

    // 감정 시스템 업데이트
    this.emotionSystem.updateBubbles();

    // 파벌 간 전투 시도 (1% 확률)
    if (this.rng.bool(0.01)) {
      const warResult = this.attemptFactionWar();
      if (warResult) {
        this.logger.info('faction', `파벌 전쟁이 발생했습니다: ${warResult}`, '', '');
      }
    }

    // 가르치기 시도 (0.5% 확률)
    if (this.rng.bool(0.005)) {
      this.attemptTeaching();
    }

    // 동물 생성 시도 (0.3% 확률)
    if (this.rng.bool(0.003)) {
      this.attemptAnimalSpawn();
    }

    // 식물 생성 시도 (0.5% 확률)
    if (this.rng.bool(0.005)) {
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
    const entity: Entity = {
      id: uuid(),
      name: this.nameGenerator.generateSpeciesName(species),
      species,
      stats: {
        str: this.rng.range(20, 80),
        agi: this.rng.range(20, 80),
        end: this.rng.range(20, 80),
        int: this.rng.range(20, 80),
        per: this.rng.range(20, 80),
        cha: this.rng.range(20, 80)
      },
      genes: {
        survival: this.rng.range(0, 1),
        reproduction: this.rng.range(0, 1),
        curiosity: this.rng.range(0, 1),
        social: this.rng.range(0, 1),
        prestige: this.rng.range(0, 1),
        fatigue: this.rng.range(0, 1)
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
        gather: this.rng.range(20, 40),
        analyze: this.rng.range(20, 40),
        craft: this.rng.range(20, 40),
        build: this.rng.range(20, 40),
        cook: this.rng.range(20, 40),
        combat: this.rng.range(20, 40),
        trade: this.rng.range(20, 40),
        lead: this.rng.range(20, 40)
      },
      knowledge: {},
      hp: 100,
      stamina: 100,
      hunger: 0,
      morale: 50,
      pos,
      age: 0,
      inventory: {
        items: {},
        maxCapacity: 100
      }
    };

    this.state.entities.push(entity);
    return entity;
  }

  // 초기 월드 생성
  generatePrimitives(count: number): void {
    // 초기 엔티티들
    for (let i = 0; i < count; i++) {
      const pos: Vec2 = {
        x: this.rng.range(0, 1000),
        y: this.rng.range(0, 1000)
      };
      this.spawnEntity('human', pos);
    }

    // 초기 파벌 생성
    this.createInitialFactions();

    // 초기 로그 추가
    this.logger.info('system', 'EdenForge 시뮬레이션이 시작되었습니다.');
    this.logger.info('system', `${count}명의 엔티티가 생성되었습니다.`);
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
    const animalSpecies: Animal['species'][] = ['wolf', 'deer', 'rabbit', 'bear', 'fox'];
    const species = this.rng.pick(animalSpecies);
    const pos: Vec2 = {
      x: this.rng.range(0, 1000),
      y: this.rng.range(0, 1000)
    };
    
    this.ecosystemSystem.createAnimal(species, pos);
  }

  // 식물 생성 시도
  private attemptPlantSpawn(): void {
    const plantSpecies: Plant['species'][] = ['tree', 'grass', 'bush', 'flower', 'mushroom'];
    const species = this.rng.pick(plantSpecies);
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