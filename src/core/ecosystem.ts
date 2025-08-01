import { Entity, Vec2 } from '../types';
import { RNG } from './utils';
import { Logger } from './utils/logger';

export interface Animal extends Entity {
  species: 'wolf' | 'deer' | 'rabbit' | 'bear' | 'fox';
  size: number; // 0-1, 크기
  speed: number; // 0-1, 이동 속도
  senses: number; // 0-1, 감지 능력
  threat: number; // 0-1, 위협도
  fear: number; // 0-1, 공포도
  pulseRadius: number; // Pulse 방출 반경
}

export interface Plant {
  id: string;
  species: 'tree' | 'grass' | 'bush' | 'flower' | 'mushroom';
  pos: Vec2;
  growth: number; // 0-1, 성장도
  resilience: number; // 0-1, 저항력
  seedDispersion: number; // 0-1, 씨앗 분산 능력
  age: number;
  hp: number;
  maxHp: number;
  size: number; // 0-1, 크기
  yield: number; // 0-1, 수확량
  isMature: boolean;
  isDead: boolean;
}

export interface Pulse {
  id: string;
  type: 'fear' | 'attraction' | 'danger' | 'food';
  source: Animal;
  pos: Vec2;
  intensity: number; // 0-1, 강도
  radius: number;
  age: number;
  maxAge: number;
}

export interface Biome {
  id: string;
  name: string;
  plantTypes: string[];
  animalTypes: string[];
  resourceRichness: number; // 0-1
  climate: 'temperate' | 'tropical' | 'arctic' | 'desert';
  growthRate: number; // 식물 성장 속도
}

export class EcosystemSystem {
  private logger: Logger;
  private rng: RNG;
  private animals: Animal[] = [];
  private plants: Plant[] = [];
  private pulses: Pulse[] = [];
  private biomes: Map<string, Biome> = new Map();

  constructor(logger: Logger) {
    this.logger = logger;
    this.rng = new RNG();
    this.initializeBiomes();
  }

  // 바이옴 초기화
  private initializeBiomes(): void {
    const biomeDefinitions: Biome[] = [
      {
        id: 'forest',
        name: '숲',
        plantTypes: ['tree', 'bush', 'mushroom'],
        animalTypes: ['deer', 'rabbit', 'fox'],
        resourceRichness: 0.8,
        climate: 'temperate',
        growthRate: 1.0
      },
      {
        id: 'grassland',
        name: '초원',
        plantTypes: ['grass', 'flower'],
        animalTypes: ['deer', 'rabbit'],
        resourceRichness: 0.6,
        climate: 'temperate',
        growthRate: 1.2
      },
      {
        id: 'mountain',
        name: '산',
        plantTypes: ['tree', 'bush'],
        animalTypes: ['bear', 'fox'],
        resourceRichness: 0.4,
        climate: 'temperate',
        growthRate: 0.8
      },
      {
        id: 'swamp',
        name: '늪',
        plantTypes: ['mushroom', 'bush'],
        animalTypes: ['fox', 'rabbit'],
        resourceRichness: 0.7,
        climate: 'tropical',
        growthRate: 1.1
      }
    ];

    for (const biome of biomeDefinitions) {
      this.biomes.set(biome.id, biome);
    }
  }

  // 동물 생성
  createAnimal(species: Animal['species'], pos: Vec2): Animal {
    const animal: Animal = {
      id: `animal_${Date.now()}_${this.rng.range(1000, 9999)}`,
      name: this.generateAnimalName(species),
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
      },
      size: this.getAnimalSize(species),
      speed: this.getAnimalSpeed(species),
      senses: this.getAnimalSenses(species),
      threat: this.getAnimalThreat(species),
      fear: 0,
      pulseRadius: this.getAnimalPulseRadius(species)
    };

    this.animals.push(animal);
    this.logger.info('ecosystem', `${animal.name} ${species}이(가) 생성되었습니다.`, animal.id, animal.name);
    
    return animal;
  }

  // 식물 생성
  createPlant(species: Plant['species'], pos: Vec2): Plant {
    const plant: Plant = {
      id: `plant_${Date.now()}_${this.rng.range(1000, 9999)}`,
      species,
      pos,
      growth: this.rng.range(0.1, 0.3),
      resilience: this.rng.range(0.3, 0.7),
      seedDispersion: this.rng.range(0.2, 0.8),
      age: 0,
      hp: 50,
      maxHp: 50,
      size: this.rng.range(0.1, 0.4),
      yield: this.rng.range(0.2, 0.6),
      isMature: false,
      isDead: false
    };

    this.plants.push(plant);
    return plant;
  }

  // 동물 특성 설정
  private getAnimalSize(species: Animal['species']): number {
    const sizes: Record<Animal['species'], number> = {
      wolf: 0.7,
      deer: 0.8,
      rabbit: 0.3,
      bear: 1.0,
      fox: 0.5
    };
    return sizes[species];
  }

  private getAnimalSpeed(species: Animal['species']): number {
    const speeds: Record<Animal['species'], number> = {
      wolf: 0.8,
      deer: 0.9,
      rabbit: 0.9,
      bear: 0.6,
      fox: 0.8
    };
    return speeds[species];
  }

  private getAnimalSenses(species: Animal['species']): number {
    const senses: Record<Animal['species'], number> = {
      wolf: 0.9,
      deer: 0.7,
      rabbit: 0.8,
      bear: 0.6,
      fox: 0.9
    };
    return senses[species];
  }

  private getAnimalThreat(species: Animal['species']): number {
    const threats: Record<Animal['species'], number> = {
      wolf: 0.8,
      deer: 0.3,
      rabbit: 0.1,
      bear: 1.0,
      fox: 0.6
    };
    return threats[species];
  }

  private getAnimalPulseRadius(species: Animal['species']): number {
    const radii: Record<Animal['species'], number> = {
      wolf: 80,
      deer: 60,
      rabbit: 40,
      bear: 100,
      fox: 70
    };
    return radii[species];
  }

  // 동물 이름 생성
  private generateAnimalName(species: Animal['species']): string {
    const names: Record<Animal['species'], string[]> = {
      wolf: ['그림자', '울프', '달빛', '야생'],
      deer: ['순이', '숲사랑', '초원', '자유'],
      rabbit: ['토끼', '깡총', '귀여미', '달리기'],
      bear: ['곰돌이', '힘쎄', '숲의왕', '강함'],
      fox: ['여우', '교활', '빨강', '영리']
    };
    return this.rng.pick(names[species]);
  }

  // 생태계 업데이트
  updateEcosystem(): void {
    this.updateAnimals();
    this.updatePlants();
    this.updatePulses();
    this.checkInteractions();
  }

  // 동물 업데이트
  private updateAnimals(): void {
    for (const animal of this.animals) {
      if (animal.hp <= 0) continue;

      // 기본 상태 감소
      animal.stamina = Math.max(0, animal.stamina - 0.1);
      animal.hunger = Math.min(100, animal.hunger + 0.05);
      animal.age += 0.001;

      // HP 자연 회복/감소
      if (animal.stamina > 50) {
        animal.hp = Math.min(100, animal.hp + 0.05);
      } else {
        animal.hp = Math.max(0, animal.hp - 0.02);
      }

      // 사망 체크
      if (animal.hp <= 0 || animal.hunger >= 100 || animal.age >= 100) {
        this.logger.warning('ecosystem', `${animal.name} ${animal.species}이(가) 사망했습니다.`, animal.id, animal.name);
        continue;
      }

      // Pulse 생성
      this.createPulse(animal);
    }

    // 사망한 동물 제거
    this.animals = this.animals.filter(animal => animal.hp > 0);
  }

  // 식물 업데이트
  private updatePlants(): void {
    for (const plant of this.plants) {
      if (plant.isDead) continue;

      // 성장
      plant.age += 0.001;
      plant.growth = Math.min(1, plant.growth + 0.002);

      // 성숙 체크
      if (plant.growth >= 0.8 && !plant.isMature) {
        plant.isMature = true;
        this.logger.info('ecosystem', `${plant.species}이(가) 성숙했습니다.`, plant.id, plant.species);
      }

      // 번식 (성숙한 식물)
      if (plant.isMature && this.rng.bool(0.01)) {
        this.reproducePlant(plant);
      }

      // 사망 체크
      if (plant.age >= 200 || plant.hp <= 0) {
        plant.isDead = true;
        this.logger.warning('ecosystem', `${plant.species}이(가) 죽었습니다.`, plant.id, plant.species);
      }
    }

    // 죽은 식물 제거
    this.plants = this.plants.filter(plant => !plant.isDead);
  }

  // 식물 번식
  private reproducePlant(parent: Plant): void {
    const distance = this.rng.range(10, 50);
    const angle = this.rng.range(0, Math.PI * 2);
    const newPos: Vec2 = {
      x: parent.pos.x + Math.cos(angle) * distance,
      y: parent.pos.y + Math.sin(angle) * distance
    };

    // 경계 체크
    if (newPos.x < 0 || newPos.x > 1000 || newPos.y < 0 || newPos.y > 1000) {
      return;
    }

    const child = this.createPlant(parent.species, newPos);
    child.growth = 0.1;
    child.age = 0;

    this.logger.info('ecosystem', `${parent.species}이(가) 번식했습니다.`, child.id, child.species);
  }

  // Pulse 생성
  private createPulse(animal: Animal): void {
    // 공포 Pulse (위험 상황에서)
    if (animal.fear > 0.5) {
      const pulse: Pulse = {
        id: `pulse_${Date.now()}_${this.rng.range(1000, 9999)}`,
        type: 'fear',
        source: animal,
        pos: { ...animal.pos },
        intensity: animal.fear,
        radius: animal.pulseRadius,
        age: 0,
        maxAge: 50
      };
      this.pulses.push(pulse);
    }

    // 위험 Pulse (포식자가 가까이 있을 때)
    if (animal.threat > 0.7) {
      const pulse: Pulse = {
        id: `pulse_${Date.now()}_${this.rng.range(1000, 9999)}`,
        type: 'danger',
        source: animal,
        pos: { ...animal.pos },
        intensity: animal.threat,
        radius: animal.pulseRadius * 1.5,
        age: 0,
        maxAge: 30
      };
      this.pulses.push(pulse);
    }
  }

  // Pulse 업데이트
  private updatePulses(): void {
    for (const pulse of this.pulses) {
      pulse.age += 1;
      
      // 강도 감소
      pulse.intensity *= 0.98;
      
      // 반경 감소
      pulse.radius *= 0.99;
    }

    // 만료된 Pulse 제거
    this.pulses = this.pulses.filter(pulse => 
      pulse.age < pulse.maxAge && pulse.intensity > 0.1
    );
  }

  // 상호작용 체크
  private checkInteractions(): void {
    // 동물 간 상호작용
    for (let i = 0; i < this.animals.length; i++) {
      for (let j = i + 1; j < this.animals.length; j++) {
        const animal1 = this.animals[i];
        const animal2 = this.animals[j];
        
        if (animal1.hp <= 0 || animal2.hp <= 0) continue;

        const distance = this.calculateDistance(animal1.pos, animal2.pos);
        
        // 포식 관계 체크
        if (this.isPredator(animal1.species, animal2.species) && distance < 30) {
          this.handlePredation(animal1, animal2);
        }
        
        // 경쟁 관계 체크
        if (this.isCompetitor(animal1.species, animal2.species) && distance < 20) {
          this.handleCompetition(animal1, animal2);
        }
      }
    }

    // 동물-식물 상호작용
    for (const animal of this.animals) {
      if (animal.hp <= 0) continue;

      for (const plant of this.plants) {
        if (plant.isDead) continue;

        const distance = this.calculateDistance(animal.pos, plant.pos);
        
        // 식물 섭취
        if (this.canEatPlant(animal.species, plant.species) && distance < 10) {
          this.handlePlantConsumption(animal, plant);
        }
      }
    }
  }

  // 포식 관계 체크
  private isPredator(predator: Animal['species'], prey: Animal['species']): boolean {
    const predatorPreyMap: Record<Animal['species'], Animal['species'][]> = {
      wolf: ['deer', 'rabbit'],
      bear: ['deer', 'rabbit'],
      fox: ['rabbit'],
      deer: [],
      rabbit: []
    };
    return predatorPreyMap[predator]?.includes(prey) || false;
  }

  // 경쟁 관계 체크
  private isCompetitor(species1: Animal['species'], species2: Animal['species']): boolean {
    const competitors: Record<Animal['species'], Animal['species'][]> = {
      wolf: ['fox'],
      fox: ['wolf'],
      deer: ['deer'],
      rabbit: ['rabbit'],
      bear: ['bear']
    };
    return competitors[species1]?.includes(species2) || false;
  }

  // 식물 섭취 가능 여부
  private canEatPlant(animalSpecies: Animal['species'], plantSpecies: Plant['species']): boolean {
    const dietMap: Record<Animal['species'], Plant['species'][]> = {
      deer: ['grass', 'flower'],
      rabbit: ['grass', 'flower'],
      bear: ['bush', 'mushroom'],
      fox: ['bush'],
      wolf: ['bush']
    };
    return dietMap[animalSpecies]?.includes(plantSpecies) || false;
  }

  // 포식 처리
  private handlePredation(predator: Animal, prey: Animal): void {
    const successChance = (predator.skills.combat - prey.skills.combat) / 100 + 0.5;
    
    if (this.rng.bool(successChance)) {
      // 포식 성공
      prey.hp = 0;
      predator.hunger = Math.max(0, predator.hunger - 30);
      predator.hp = Math.min(100, predator.hp + 20);
      
      this.logger.success('ecosystem', `${predator.name}이(가) ${prey.name}을(를) 사냥했습니다!`, predator.id, predator.name, { prey: prey.name });
    } else {
      // 포식 실패
      prey.fear = Math.min(1, prey.fear + 0.3);
      predator.stamina = Math.max(0, predator.stamina - 10);
      
      this.logger.info('ecosystem', `${prey.name}이(가) ${predator.name}으로부터 도망쳤습니다.`, prey.id, prey.name);
    }
  }

  // 경쟁 처리
  private handleCompetition(animal1: Animal, animal2: Animal): void {
    const strength1 = animal1.stats.str + animal1.skills.combat;
    const strength2 = animal2.stats.str + animal2.skills.combat;
    
    if (strength1 > strength2) {
      animal2.morale = Math.max(0, animal2.morale - 10);
      animal2.fear = Math.min(1, animal2.fear + 0.2);
    } else if (strength2 > strength1) {
      animal1.morale = Math.max(0, animal1.morale - 10);
      animal1.fear = Math.min(1, animal1.fear + 0.2);
    }
  }

  // 식물 섭취 처리
  private handlePlantConsumption(animal: Animal, plant: Plant): void {
    if (plant.hp <= 0) return;

    const consumption = Math.min(plant.hp, 10);
    plant.hp -= consumption;
    animal.hunger = Math.max(0, animal.hunger - consumption * 0.5);
    
    if (plant.hp <= 0) {
      this.logger.info('ecosystem', `${animal.name}이(가) ${plant.species}을(를) 먹었습니다.`, animal.id, animal.name);
    }
  }

  // 거리 계산
  private calculateDistance(pos1: Vec2, pos2: Vec2): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Pulse 영향 계산
  calculatePulseInfluence(pos: Vec2): { fear: number; danger: number; attraction: number; food: number } {
    let fear = 0;
    let danger = 0;
    let attraction = 0;
    let food = 0;

    for (const pulse of this.pulses) {
      const distance = this.calculateDistance(pos, pulse.pos);
      if (distance <= pulse.radius) {
        const influence = pulse.intensity * (1 - distance / pulse.radius);
        
        switch (pulse.type) {
          case 'fear':
            fear = Math.max(fear, influence);
            break;
          case 'danger':
            danger = Math.max(danger, influence);
            break;
          case 'attraction':
            attraction = Math.max(attraction, influence);
            break;
          case 'food':
            food = Math.max(food, influence);
            break;
        }
      }
    }

    return { fear, danger, attraction, food };
  }

  // 동물 목록 조회
  getAnimals(): Animal[] {
    return this.animals;
  }

  // 식물 목록 조회
  getPlants(): Plant[] {
    return this.plants;
  }

  // Pulse 목록 조회
  getPulses(): Pulse[] {
    return this.pulses;
  }

  // 바이옴 목록 조회
  getBiomes(): Biome[] {
    return Array.from(this.biomes.values());
  }

  // 특정 위치의 바이옴 조회
  getBiomeAt(pos: Vec2): Biome | null {
    // 간단한 바이옴 결정 로직 (실제로는 더 복잡할 수 있음)
    const x = pos.x / 1000;
    const y = pos.y / 1000;
    
    if (x < 0.3 && y < 0.3) return this.biomes.get('forest');
    if (x > 0.7 && y < 0.5) return this.biomes.get('grassland');
    if (x < 0.5 && y > 0.7) return this.biomes.get('mountain');
    if (x > 0.7 && y > 0.7) return this.biomes.get('swamp');
    
    return this.biomes.get('forest'); // 기본값
  }
} 