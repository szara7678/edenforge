import { Entity, GeneWeights, EpiDelta } from '../types';
import { RNG } from './utils';
import { Logger } from './utils/logger';

export interface GeneticTrait {
  id: string;
  name: string;
  description: string;
  effect: {
    type: 'stat' | 'skill' | 'gene' | 'epi';
    target: string;
    value: number;
  };
  rarity: number; // 0-1, 희귀도
  dominant: boolean; // 우성/열성
}

export interface Chromosome {
  genes: GeneWeights;
  epigenetics: EpiDelta;
  mutations: string[];
  age: number;
}

export interface MatingResult {
  child: Entity;
  parents: [Entity, Entity];
  inheritedTraits: string[];
  mutations: string[];
}

export class GeneticsSystem {
  private logger: Logger;
  private rng: RNG;
  private traits: Map<string, GeneticTrait> = new Map();

  constructor(logger: Logger) {
    this.logger = logger;
    this.rng = new RNG();
    this.initializeTraits();
  }

  // 유전 특성 초기화
  private initializeTraits(): void {
    const traitDefinitions: GeneticTrait[] = [
      {
        id: 'strong_genes',
        name: '강한 유전자',
        description: '체력과 힘이 뛰어남',
        effect: { type: 'stat', target: 'str', value: 10 },
        rarity: 0.3,
        dominant: true
      },
      {
        id: 'agile_genes',
        name: '민첩한 유전자',
        description: '민첩성과 반응 속도가 뛰어남',
        effect: { type: 'stat', target: 'agi', value: 10 },
        rarity: 0.3,
        dominant: true
      },
      {
        id: 'endurance_genes',
        name: '지구력 유전자',
        description: '체력과 지구력이 뛰어남',
        effect: { type: 'stat', target: 'end', value: 10 },
        rarity: 0.3,
        dominant: true
      },
      {
        id: 'intelligent_genes',
        name: '지능 유전자',
        description: '지능과 학습 능력이 뛰어남',
        effect: { type: 'stat', target: 'int', value: 10 },
        rarity: 0.2,
        dominant: true
      },
      {
        id: 'perceptive_genes',
        name: '지각 유전자',
        description: '관찰력과 감지 능력이 뛰어남',
        effect: { type: 'stat', target: 'per', value: 10 },
        rarity: 0.2,
        dominant: true
      },
      {
        id: 'charismatic_genes',
        name: '매력 유전자',
        description: '매력과 사회성이 뛰어남',
        effect: { type: 'stat', target: 'cha', value: 10 },
        rarity: 0.2,
        dominant: true
      },
      {
        id: 'combat_aptitude',
        name: '전투 적성',
        description: '전투 스킬 향상 속도가 빠름',
        effect: { type: 'skill', target: 'combat', value: 5 },
        rarity: 0.4,
        dominant: true
      },
      {
        id: 'crafting_aptitude',
        name: '제작 적성',
        description: '제작 스킬 향상 속도가 빠름',
        effect: { type: 'skill', target: 'craft', value: 5 },
        rarity: 0.4,
        dominant: true
      },
      {
        id: 'survival_instinct',
        name: '생존 본능',
        description: '생존 욕구가 강함',
        effect: { type: 'gene', target: 'survival', value: 0.2 },
        rarity: 0.5,
        dominant: true
      },
      {
        id: 'social_instinct',
        name: '사회성 본능',
        description: '사회적 욕구가 강함',
        effect: { type: 'gene', target: 'social', value: 0.2 },
        rarity: 0.5,
        dominant: true
      },
      {
        id: 'curiosity_instinct',
        name: '호기심 본능',
        description: '호기심 욕구가 강함',
        effect: { type: 'gene', target: 'curiosity', value: 0.2 },
        rarity: 0.3,
        dominant: false
      },
      {
        id: 'prestige_instinct',
        name: '명예 본능',
        description: '명예 욕구가 강함',
        effect: { type: 'gene', target: 'prestige', value: 0.2 },
        rarity: 0.3,
        dominant: false
      }
    ];

    for (const trait of traitDefinitions) {
      this.traits.set(trait.id, trait);
    }
  }

  // 유전자 교차 (Crossover)
  private crossoverGenes(parent1: Entity, parent2: Entity): GeneWeights {
    const childGenes: GeneWeights = {
      survival: 0,
      reproduction: 0,
      curiosity: 0,
      social: 0,
      prestige: 0,
      fatigue: 0
    };

    // 각 유전자를 부모로부터 랜덤하게 상속
    for (const key of Object.keys(childGenes) as Array<keyof GeneWeights>) {
      if (this.rng.bool(0.5)) {
        childGenes[key] = parent1.genes[key];
      } else {
        childGenes[key] = parent2.genes[key];
      }
    }

    return childGenes;
  }

  // 돌연변이 생성
  private generateMutations(): string[] {
    const mutations: string[] = [];
    
    // 10% 확률로 돌연변이 발생
    if (this.rng.bool(0.1)) {
      const availableTraits = Array.from(this.traits.values());
      const mutation = this.rng.pick(availableTraits);
      mutations.push(mutation.id);
    }

    return mutations;
  }

  // 유전 특성 적용
  private applyGeneticTraits(entity: Entity, mutations: string[]): void {
    for (const mutationId of mutations) {
      const trait = this.traits.get(mutationId);
      if (!trait) continue;

      const { effect } = trait;
      
      switch (effect.type) {
        case 'stat':
          if (effect.target in entity.stats) {
            entity.stats[effect.target as keyof typeof entity.stats] += effect.value;
          }
          break;
        case 'skill':
          if (effect.target in entity.skills) {
            entity.skills[effect.target as keyof typeof entity.skills] += effect.value;
          }
          break;
        case 'gene':
          if (effect.target in entity.genes) {
            entity.genes[effect.target as keyof GeneWeights] += effect.value;
          }
          break;
        case 'epi':
          if (effect.target in entity.epi) {
            entity.epi[effect.target as keyof EpiDelta] += effect.value;
          }
          break;
      }
    }
  }

  // 자식 엔티티 생성
  createChild(parent1: Entity, parent2: Entity, pos: { x: number; y: number }): Entity {
    // 기본 엔티티 생성
    const child: Entity = {
      id: `entity_${Date.now()}_${this.rng.range(1000, 9999)}`,
      name: this.generateChildName(parent1, parent2),
      species: parent1.species, // 부모와 같은 종족
      stats: {
        str: Math.floor((parent1.stats.str + parent2.stats.str) / 2),
        agi: Math.floor((parent1.stats.agi + parent2.stats.agi) / 2),
        end: Math.floor((parent1.stats.end + parent2.stats.end) / 2),
        int: Math.floor((parent1.stats.int + parent2.stats.int) / 2),
        per: Math.floor((parent1.stats.per + parent2.stats.per) / 2),
        cha: Math.floor((parent1.stats.cha + parent2.stats.cha) / 2)
      },
      genes: this.crossoverGenes(parent1, parent2),
      epi: {
        survival: (parent1.epi.survival + parent2.epi.survival) / 2,
        reproduction: (parent1.epi.reproduction + parent2.epi.reproduction) / 2,
        curiosity: (parent1.epi.curiosity + parent2.epi.curiosity) / 2,
        social: (parent1.epi.social + parent2.epi.social) / 2,
        prestige: (parent1.epi.prestige + parent2.epi.prestige) / 2,
        fatigue: (parent1.epi.fatigue + parent2.epi.fatigue) / 2
      },
      skills: {
        gather: Math.floor((parent1.skills.gather + parent2.skills.gather) / 2),
        analyze: Math.floor((parent1.skills.analyze + parent2.skills.analyze) / 2),
        craft: Math.floor((parent1.skills.craft + parent2.skills.craft) / 2),
        build: Math.floor((parent1.skills.build + parent2.skills.build) / 2),
        cook: Math.floor((parent1.skills.cook + parent2.skills.cook) / 2),
        combat: Math.floor((parent1.skills.combat + parent2.skills.combat) / 2),
        trade: Math.floor((parent1.skills.trade + parent2.skills.trade) / 2),
        lead: Math.floor((parent1.skills.lead + parent2.skills.lead) / 2)
      },
      knowledge: { ...parent1.knowledge }, // 부모의 지식 일부 상속
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

    // 돌연변이 생성 및 적용
    const mutations = this.generateMutations();
    this.applyGeneticTraits(child, mutations);

    // 유전 특성 로그
    if (mutations.length > 0) {
      this.logger.success('genetics', `${child.name}에게 ${mutations.length}개의 돌연변이가 발생했습니다.`, child.id, child.name, { mutations });
    }

    this.logger.info('genetics', `${parent1.name}과(와) ${parent2.name}의 자식 ${child.name}이(가) 태어났습니다.`, child.id, child.name, { 
      parents: [parent1.name, parent2.name],
      mutations 
    });

    return child;
  }

  // 자식 이름 생성
  private generateChildName(parent1: Entity, parent2: Entity): string {
    const names = ['아린', '벨라', '카이', '루나', '토르', '프레이', '마야', '제이크', '소피', '리오', '노아', '에바', '리암', '올리비아'];
    return this.rng.pick(names);
  }

  // 유전 적합성 계산
  calculateGeneticCompatibility(entity1: Entity, entity2: Entity): number {
    // 유전적 다양성을 위한 계산
    let compatibility = 0.5; // 기본 호환성

    // 유전자 차이에 따른 호환성 조정
    const geneDiff = Math.abs(entity1.genes.survival - entity2.genes.survival) +
                    Math.abs(entity1.genes.reproduction - entity2.genes.reproduction) +
                    Math.abs(entity1.genes.curiosity - entity2.genes.curiosity) +
                    Math.abs(entity1.genes.social - entity2.genes.social) +
                    Math.abs(entity1.genes.prestige - entity2.genes.prestige) +
                    Math.abs(entity1.genes.fatigue - entity2.genes.fatigue);

    // 너무 비슷하거나 너무 다른 경우 호환성 감소
    if (geneDiff < 0.5) {
      compatibility -= 0.2; // 근친상간 방지
    } else if (geneDiff > 3.0) {
      compatibility -= 0.1; // 너무 다른 유전자
    } else {
      compatibility += 0.1; // 적절한 차이
    }

    // 나이 차이에 따른 조정
    const ageDiff = Math.abs(entity1.age - entity2.age);
    if (ageDiff > 20) {
      compatibility -= 0.2;
    }

    return Math.max(0, Math.min(1, compatibility));
  }

  // 유전 특성 획득
  acquireTrait(entity: Entity, traitId: string): boolean {
    const trait = this.traits.get(traitId);
    if (!trait) return false;

    // 이미 가지고 있는 특성인지 확인
    if (entity.geneticTraits && entity.geneticTraits.includes(traitId)) {
      return false;
    }

    // 특성 획득 확률 계산
    const acquisitionChance = trait.rarity * (1 + entity.stats.int * 0.01);
    
    if (this.rng.bool(acquisitionChance)) {
      this.applyGeneticTraits(entity, [traitId]);
      
      if (!entity.geneticTraits) {
        entity.geneticTraits = [];
      }
      entity.geneticTraits.push(traitId);

      this.logger.success('genetics', `${entity.name}이(가) ${trait.name} 특성을 획득했습니다!`, entity.id, entity.name, { trait: trait.name });
      return true;
    }

    return false;
  }

  // 유전 특성 목록 조회
  getAvailableTraits(): GeneticTrait[] {
    return Array.from(this.traits.values());
  }

  // 엔티티의 유전 특성 조회
  getEntityTraits(entity: Entity): GeneticTrait[] {
    if (!entity.geneticTraits) return [];
    
    return entity.geneticTraits
      .map(traitId => this.traits.get(traitId))
      .filter(trait => trait !== undefined) as GeneticTrait[];
  }
} 