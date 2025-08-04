import { Vec2, StimKey } from '../../types';
import { parameterManager } from '../../parameters';

/** 랜덤 생성기 */
export class RNG {
  private seed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  bool(probability: number): boolean {
    return this.next() < probability;
  }

  pick<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }

  normal(mean: number, stdDev: number): number {
    let u = 0, v = 0;
    while (u === 0) u = this.next();
    while (v === 0) v = this.next();
    return mean + stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
}

/** 벡터 연산 */
export const vec2 = {
  add(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x + b.x, y: a.y + b.y };
  },

  sub(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x - b.x, y: a.y - b.y };
  },

  mul(a: Vec2, scalar: number): Vec2 {
    return { x: a.x * scalar, y: a.y * scalar };
  },

  dist(a: Vec2, b: Vec2): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  normalize(v: Vec2): Vec2 {
    const len = Math.sqrt(v.x * v.x + v.y * v.y);
    if (len === 0) return { x: 0, y: 0 };
    return { x: v.x / len, y: v.y / len };
  }
};

/** 수학 유틸리티 */
export const math = {
  clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  },

  clamp01(value: number): number {
    return this.clamp(value, 0, 1);
  },

  lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  },

  dot(a: Record<string, number>, b: Record<string, number>): number {
    let sum = 0;
    for (const key in a) {
      if (b[key] !== undefined) {
        sum += a[key] * b[key];
      }
    }
    return sum;
  },

  addVec(a: Record<string, number>, b: Record<string, number>): Record<string, number> {
    const result: Record<string, number> = {};
    for (const key in a) {
      result[key] = a[key];
    }
    for (const key in b) {
      result[key] = (result[key] || 0) + b[key];
    }
    return result;
  }
};

/** UUID 생성 */
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/** Stim 계산 */
export function calculateStim(entity: any): Record<StimKey, number> {
  // 배고픔이 높을 때 survival 욕구 강화
  const hungerFactor = entity.hunger / 100;
  const survivalStim = Math.max(
    1 - entity.hp / 100, 
    1 - entity.stamina / 100,
    hungerFactor * 0.8 // 배고픔이 높을수록 survival 욕구 증가
  );
  
  // 지능과 분석 스킬에 따른 호기심 욕구 - 파라미터 사용
  const intelligenceFactor = (entity.stats.int || 0) / 100;
  const analyzeSkillFactor = (entity.skills.analyze || 0) / 100;
  const curiosityIntelligenceBonus = parameterManager.getParameter('entity', 'curiosityIntelligenceBonus');
  const curiosityAnalyzeBonus = parameterManager.getParameter('entity', 'curiosityAnalyzeBonus');
  const curiosityMaxStim = parameterManager.getParameter('entity', 'curiosityMaxStim');
  const curiosityStim = Math.min(curiosityMaxStim, 0.3 + intelligenceFactor * curiosityIntelligenceBonus + analyzeSkillFactor * curiosityAnalyzeBonus);
  
  const stim: Record<StimKey, number> = {
    survival: survivalStim,
    reproduction: 0, // 나중에 구현
    curiosity: curiosityStim,
    social: 0.2,
    prestige: 0.1,
    fatigue: 1 - entity.stamina / 100
  };
  return stim;
}

/** 욕구 계산 */
export function calculateDesire(_entity: any, stim: Record<StimKey, number>): Record<StimKey, number> {
  const danger = stim.survival;
  const damp = math.lerp(1, 0.3, danger);
  
  // 생존 위험이 높으면 다른 욕구 약화
  for (const key in stim) {
    if (key !== 'survival') {
      stim[key as StimKey] *= damp;
    }
  }
  
  return stim;
} 