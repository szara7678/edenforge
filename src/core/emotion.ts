import { Entity, StimKey } from '../types';
import { RNG } from './utils';

export interface EmotionBubble {
  id: string;
  entityId: string;
  emoji: string;
  message: string;
  type: 'emotion' | 'action' | 'thought' | 'speech';
  intensity: number; // 0-1, 강도
  duration: number; // 지속 시간 (tick)
  age: number; // 현재 나이
  position: { x: number; y: number };
}

export interface EmotionState {
  happiness: number; // 0-1
  fear: number; // 0-1
  anger: number; // 0-1
  curiosity: number; // 0-1
  satisfaction: number; // 0-1
  stress: number; // 0-1
}

export class EmotionSystem {
  private rng: RNG;
  private bubbles: EmotionBubble[] = [];

  constructor() {
    this.rng = new RNG();
  }

  // 감정 상태 계산
  calculateEmotionState(entity: Entity): EmotionState {
    const stim = this.calculateStim(entity);
    
    return {
      happiness: this.calculateHappiness(entity, stim),
      fear: this.calculateFear(entity, stim),
      anger: this.calculateAnger(entity, stim),
      curiosity: this.calculateCuriosity(entity, stim),
      satisfaction: this.calculateSatisfaction(entity, stim),
      stress: this.calculateStress(entity, stim)
    };
  }

  private calculateStim(entity: Entity): Record<StimKey, number> {
    return {
      survival: Math.max(1 - entity.hp / 100, 1 - entity.stamina / 100, entity.hunger / 100),
      reproduction: entity.age > 20 ? 0.5 : 0,
      curiosity: entity.stats.int / 100,
      social: entity.stats.cha / 100,
      prestige: entity.stats.per / 100,
      fatigue: 1 - entity.stamina / 100
    };
  }

  private calculateHappiness(entity: Entity, stim: Record<StimKey, number>): number {
    const baseHappiness = (entity.hp / 100 + entity.stamina / 100) / 2;
    const hungerFactor = 1 - entity.hunger / 100;
    const socialFactor = stim.social;
    
    return Math.max(0, Math.min(1, (baseHappiness + hungerFactor + socialFactor) / 3));
  }

  private calculateFear(entity: Entity, stim: Record<StimKey, number>): number {
    const survivalThreat = stim.survival;
    const lowHealth = entity.hp < 30 ? 0.5 : 0;
    const lowStamina = entity.stamina < 20 ? 0.3 : 0;
    
    return Math.max(0, Math.min(1, survivalThreat + lowHealth + lowStamina));
  }

  private calculateAnger(entity: Entity, stim: Record<StimKey, number>): number {
    const frustration = 1 - entity.morale / 100;
    const hunger = entity.hunger / 100;
    const fatigue = stim.fatigue;
    
    return Math.max(0, Math.min(1, (frustration + hunger + fatigue) / 3));
  }

  private calculateCuriosity(entity: Entity, stim: Record<StimKey, number>): number {
    return stim.curiosity;
  }

  private calculateSatisfaction(entity: Entity, stim: Record<StimKey, number>): number {
    const health = entity.hp / 100;
    const energy = entity.stamina / 100;
    const social = stim.social;
    
    return Math.max(0, Math.min(1, (health + energy + social) / 3));
  }

  private calculateStress(entity: Entity, stim: Record<StimKey, number>): number {
    const survival = stim.survival;
    const fatigue = stim.fatigue;
    const hunger = entity.hunger / 100;
    
    return Math.max(0, Math.min(1, (survival + fatigue + hunger) / 3));
  }

  // 행동에 따른 이모지 말풍선 생성 (성능 최적화)
  createActionBubble(entity: Entity, action: string, success: boolean): EmotionBubble | null {
    // 말풍선 생성 확률 제한 (성능 향상)
    if (!this.rng.bool(0.3)) { // 30% 확률로만 생성
      return null;
    }
    
    const emotionState = this.calculateEmotionState(entity);
    const bubble = this.generateActionBubble(entity, action, success, emotionState);
    
    if (bubble) {
      this.bubbles.push(bubble);
    }
    
    return bubble;
  }

  private generateActionBubble(
    entity: Entity, 
    action: string, 
    success: boolean, 
    emotion: EmotionState
  ): EmotionBubble | null {
    const actionEmojis: Record<string, { success: string; failure: string; message: string }> = {
      'Gather': {
        success: '🌾',
        failure: '😤',
        message: success ? '채집 성공!' : '채집 실패...'
      },
      'Eat': {
        success: '🍖',
        failure: '😵',
        message: success ? '맛있어!' : '배고파...'
      },
      'Rest': {
        success: '😴',
        failure: '😫',
        message: success ? '휴식 중' : '잠들 수 없어'
      },
      'Move': {
        success: '🚶',
        failure: '😰',
        message: success ? '이동 중' : '힘들어...'
      },
      'Craft': {
        success: '⚒️',
        failure: '😤',
        message: success ? '제작 성공!' : '제작 실패'
      },
      'Build': {
        success: '🏗️',
        failure: '😤',
        message: success ? '건설 중' : '건설 실패'
      },
      'Research': {
        success: '🔬',
        failure: '🤔',
        message: success ? '연구 중' : '이해 안돼...'
      },
      'Social': {
        success: '💬',
        failure: '😔',
        message: success ? '대화 중' : '외로워...'
      },
      'Trade': {
        success: '🤝',
        failure: '😤',
        message: success ? '거래 성공!' : '거래 실패'
      },
      'Mate': {
        success: '💕',
        failure: '😔',
        message: success ? '사랑 중' : '거절당함...'
      },
      'Combat': {
        success: '⚔️',
        failure: '😵',
        message: success ? '전투 승리!' : '전투 패배...'
      }
    };

    const actionData = actionEmojis[action];
    if (!actionData) return null;

    const emoji = success ? actionData.success : actionData.failure;
    const message = actionData.message;
    
    // 감정에 따른 추가 이모지
    let emotionEmoji = '';
    if (emotion.fear > 0.7) emotionEmoji = '😨';
    else if (emotion.anger > 0.7) emotionEmoji = '😠';
    else if (emotion.happiness > 0.7) emotionEmoji = '😊';
    else if (emotion.curiosity > 0.7) emotionEmoji = '🤔';
    else if (emotion.satisfaction > 0.7) emotionEmoji = '😌';
    else if (emotion.stress > 0.7) emotionEmoji = '😰';

    const finalEmoji = emotionEmoji ? `${emoji}${emotionEmoji}` : emoji;

    return {
      id: `bubble_${Date.now()}_${this.rng.range(1000, 9999)}`,
      entityId: entity.id,
      emoji: finalEmoji,
      message,
      type: 'action',
      intensity: success ? 0.8 : 0.5,
      duration: 30,
      age: 0,
      position: { ...entity.pos }
    };
  }

  // 감정에 따른 이모지 말풍선 생성 (상호작용 시에만)
  createEmotionBubble(entity: Entity, interactionType: 'combat' | 'social' | 'trade' | 'mate'): EmotionBubble | null {
    const emotion = this.calculateEmotionState(entity);
    
    // 상호작용 타입에 따른 이모지
    const interactionEmojis = {
      combat: { success: '⚔️', failure: '😵', message: '전투!' },
      social: { success: '💬', failure: '😔', message: '대화' },
      trade: { success: '🤝', failure: '😤', message: '거래' },
      mate: { success: '💕', failure: '😔', message: '사랑' }
    };

    const interactionData = interactionEmojis[interactionType];
    
    // 감정에 따른 추가 이모지
    let emotionEmoji = '';
    if (emotion.fear > 0.7) emotionEmoji = '😨';
    else if (emotion.anger > 0.7) emotionEmoji = '😠';
    else if (emotion.happiness > 0.7) emotionEmoji = '😊';
    else if (emotion.curiosity > 0.7) emotionEmoji = '🤔';
    else if (emotion.satisfaction > 0.7) emotionEmoji = '😌';
    else if (emotion.stress > 0.7) emotionEmoji = '😰';

    const finalEmoji = emotionEmoji ? `${interactionData.success}${emotionEmoji}` : interactionData.success;

    return {
      id: `bubble_${Date.now()}_${this.rng.range(1000, 9999)}`,
      entityId: entity.id,
      emoji: finalEmoji,
      message: interactionData.message,
      type: 'emotion',
      intensity: 0.8,
      duration: 15, // 짧은 지속시간
      age: 0,
      position: { ...entity.pos }
    };
  }

  // 생각 말풍선 생성
  createThoughtBubble(entity: Entity, thought: string): EmotionBubble {
    const thoughts = [
      { emoji: '💭', message: '생각 중...' },
      { emoji: '🤔', message: '음...' },
      { emoji: '💡', message: '아하!' },
      { emoji: '😴', message: '졸려...' },
      { emoji: '🍖', message: '배고파...' },
      { emoji: '💕', message: '사랑하고 싶어...' },
      { emoji: '⚔️', message: '싸우고 싶어!' },
      { emoji: '🏗️', message: '뭔가 만들어보자' },
      { emoji: '🔬', message: '연구해보자' },
      { emoji: '💬', message: '누군가와 대화하고 싶어' }
    ];

    const thoughtData = this.rng.pick(thoughts);

    return {
      id: `bubble_${Date.now()}_${this.rng.range(1000, 9999)}`,
      entityId: entity.id,
      emoji: thoughtData.emoji,
      message: thoughtData.message,
      type: 'thought',
      intensity: 0.6,
      duration: 25,
      age: 0,
      position: { ...entity.pos }
    };
  }

  // 대화 말풍선 생성
  createSpeechBubble(entity: Entity, targetEntity: Entity, topic: string): EmotionBubble {
    const speeches = [
      { emoji: '💬', message: `"${targetEntity.name}에게 인사"` },
      { emoji: '🤝', message: `"${targetEntity.name}와 협력"` },
      { emoji: '💕', message: `"${targetEntity.name}를 사랑해"` },
      { emoji: '⚔️', message: `"${targetEntity.name}와 싸우자"` },
      { emoji: '🔬', message: `"${topic}에 대해 이야기"` },
      { emoji: '🏗️', message: `"함께 건설하자"` },
      { emoji: '🌾', message: `"함께 채집하자"` },
      { emoji: '💡', message: `"새로운 아이디어!"` }
    ];

    const speechData = this.rng.pick(speeches);

    return {
      id: `bubble_${Date.now()}_${this.rng.range(1000, 9999)}`,
      entityId: entity.id,
      emoji: speechData.emoji,
      message: speechData.message,
      type: 'speech',
      intensity: 0.7,
      duration: 35,
      age: 0,
      position: { ...entity.pos }
    };
  }

  // 말풍선 업데이트 (성능 최적화)
  updateBubbles(): void {
    // 최대 말풍선 수 제한 (성능 향상)
    if (this.bubbles.length > 15) {
      this.bubbles = this.bubbles.slice(-10); // 최신 10개만 유지
    }
    
    for (const bubble of this.bubbles) {
      bubble.age += 1;
    }

    // 만료된 말풍선 제거
    this.bubbles = this.bubbles.filter(bubble => bubble.age < bubble.duration);
  }

  // 말풍선 목록 조회
  getBubbles(): EmotionBubble[] {
    return this.bubbles;
  }

  // 엔티티의 말풍선 조회
  getBubblesForEntity(entityId: string): EmotionBubble[] {
    return this.bubbles.filter(bubble => bubble.entityId === entityId);
  }

  // 모든 말풍선 제거
  clearBubbles(): void {
    this.bubbles = [];
  }
} 