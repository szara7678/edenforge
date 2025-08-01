/** Stim, 유전, 학습 */
export type StimKey = 'survival' | 'reproduction' | 'curiosity' | 'social' | 'prestige' | 'fatigue';
export type GeneWeights = Record<StimKey, number>;   // 0–1
export type EpiDelta = Record<StimKey, number>;   // –0.5–+0.5

/** 스킬 시스템 */
export type SkillKey = 'gather' | 'analyze' | 'craft' | 'build' | 'cook' | 'combat' | 'trade' | 'lead';

/** 지식 시스템 */
export type KnowledgeType = 'MaterialAnalysis' | 'Recipe' | 'Blueprint' | 'CombatTactic' | 'Agricultural' | 'CulturalRite';
export type KnowledgeId = string; // mat_<uuid>, rec_<uuid>, bp_<uuid>, ct_<slug>, ag_<slug>, cu_<slug>
export type Knowledge = Record<KnowledgeId, number>; // 값 0‒1 (숙련·정확도)

/** 로그 시스템 */
export type LogLevel = 'info' | 'warning' | 'error' | 'success';
export type LogCategory = 'entity' | 'material' | 'combat' | 'research' | 'system' | 'genetics' | 'learning' | 'emotion' | 'faction';

export interface GameLog {
  id: string;
  timestamp: number;
  level: LogLevel;
  category: LogCategory;
  message: string;
  entityId?: string;
  entityName?: string;
  data?: any;
}

/** 벡터 타입 */
export interface Vec2 {
  x: number;
  y: number;
}

/** 인벤토리 */
export interface Inventory {
  items: Record<string, number>;
  maxCapacity: number;
}

/** 생태계 시스템 */
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

/** 감정 시스템 */
export interface EmotionBubble {
  id: string;
  entityId: string;
  emoji: string;
  message: string;
  type: 'emotion' | 'action' | 'thought' | 'speech';
  intensity: number; // 0-1, 강도
  duration: number; // 지속 시간 (tick)
  age: number; // 현재 나이
  position: Vec2;
}

export interface EmotionState {
  happiness: number; // 0-1
  fear: number; // 0-1
  anger: number; // 0-1
  curiosity: number; // 0-1
  satisfaction: number; // 0-1
  stress: number; // 0-1
}

/** Entity */
export interface Entity {
  id: string;
  name: string; // 이름 추가
  species: 'human' | 'wolf' | 'deer' | 'rabbit' | 'bear' | 'fox';
  stats: {
    str: number; // 힘
    agi: number; // 민첩
    end: number; // 체력
    int: number; // 지능
    per: number; // 지각
    cha: number; // 매력
  };
  genes: GeneWeights;
  epi: EpiDelta;
  skills: Record<SkillKey, number>;    // 0–100
  knowledge: Knowledge;
  hp: number;
  stamina: number;
  hunger: number;
  morale: number;
  pos: Vec2;
  age: number;
  factionId?: string;
  inventory: Inventory;
  geneticTraits?: string[]; // 유전 특성 목록
  learningExperiences?: Array<{
    id: string;
    type: 'skill' | 'knowledge' | 'behavior';
    target: string;
    value: number;
    timestamp: number;
    description: string;
  }>; // 학습 경험 목록
}

/** Material */
export interface Material {
  id: string;
  name: string;
  tier: number;
  props: Record<string, number>;
  parents?: [string, string];
}

/** Equipment / Tool / Building – 공통 필드 */
export interface EquipLike {
  id: string;
  category: string;
  type: string;
  materialIds: string[];
  props: Record<string, number>;
}

export type Equipment = EquipLike;
export type Tool = EquipLike;
export type Building = EquipLike;

/** 지식 아이템 */
export interface KnowledgeItem {
  id: string;
  type: 'scroll' | 'tablet' | 'book';
  entries: KnowledgeId[];
  accuracy: number; // 0‒1, 열람 시 gain×accuracy
}

/** 액션 타입 */
export type ActionType = 'Gather' | 'Eat' | 'Rest' | 'Move' | 'Craft' | 'Build' | 'Research' | 'Teach' | 'Combat' | 'Trade' | 'Mate' | 'Social' | 'Explore' | 'Sleep';

/** 액션 훅 */
export interface ActionHook {
  (actor: Entity, params: any): { ok: boolean; message?: string };
}

/** 파벌 시스템 */
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

/** 월드 상태 */
export interface WorldState {
  entities: Entity[];
  materials: Material[];
  buildings: Building[];
  tools: Tool[];
  equipment: Equipment[];
  knowledgeItems: KnowledgeItem[];
  logs: GameLog[]; // 로그 추가
  factions: Faction[]; // 파벌 추가
  factionRelations: FactionRelation[]; // 파벌 관계 추가
  animals: Animal[]; // 동물 추가
  plants: Plant[]; // 식물 추가
  pulses: Pulse[]; // Pulse 추가
  biomes: Biome[]; // 바이옴 추가
  emotionBubbles: EmotionBubble[]; // 감정 말풍선 추가
  tick: number;
  time: number;
} 