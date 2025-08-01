import { Entity, SkillKey, KnowledgeId } from '../types';
import { RNG } from './utils';
import { Logger } from './utils/logger';

export interface LearningExperience {
  id: string;
  type: 'skill' | 'knowledge' | 'behavior';
  target: string;
  value: number;
  timestamp: number;
  description: string;
}

export interface TeachingSession {
  teacher: Entity;
  student: Entity;
  subject: SkillKey | KnowledgeId;
  effectiveness: number;
  duration: number;
}

export interface LearningModifier {
  type: 'bonus' | 'penalty';
  source: string;
  value: number;
  duration: number;
}

export class LearningSystem {
  private logger: Logger;
  private rng: RNG;
  private teachingSessions: Map<string, TeachingSession> = new Map();
  private learningModifiers: Map<string, LearningModifier[]> = new Map();

  constructor(logger: Logger) {
    this.logger = logger;
    this.rng = new RNG();
  }

  // 경험 기반 학습
  learnFromExperience(entity: Entity, action: string, success: boolean, intensity: number = 1): void {
    const baseLearning = success ? 0.5 : 0.2; // 성공 시 더 많이 학습
    const learningRate = this.calculateLearningRate(entity);
    const experienceGain = baseLearning * intensity * learningRate;

    // 행동에 따른 스킬 향상
    const skillGain = this.mapActionToSkill(action);
    if (skillGain) {
      const oldSkill = entity.skills[skillGain];
      entity.skills[skillGain] = Math.min(100, oldSkill + experienceGain);
      
      if (entity.skills[skillGain] > oldSkill) {
        this.logger.info('learning', `${entity.name}의 ${skillGain} 스킬이 향상되었습니다.`, entity.id, entity.name, {
          skill: skillGain,
          oldValue: oldSkill,
          newValue: entity.skills[skillGain],
          gain: entity.skills[skillGain] - oldSkill
        });
      }
    }

    // 지식 획득 (연구 행동의 경우)
    if (action === 'Research' && success) {
      this.acquireKnowledge(entity, intensity);
    }

    // 학습 경험 기록
    this.recordLearningExperience(entity, action, experienceGain, success);
  }

  // 행동을 스킬로 매핑
  private mapActionToSkill(action: string): SkillKey | null {
    const actionSkillMap: Record<string, SkillKey> = {
      'Gather': 'gather',
      'Eat': 'cook',
      'Craft': 'craft',
      'Build': 'build',
      'Research': 'analyze',
      'Combat': 'combat',
      'Trade': 'trade',
      'Social': 'lead'
    };

    return actionSkillMap[action] || null;
  }

  // 학습률 계산
  private calculateLearningRate(entity: Entity): number {
    let rate = 1.0;

    // 지능에 따른 보너스
    rate += entity.stats.int * 0.01;

    // 나이에 따른 페널티 (나이가 많을수록 학습 속도 감소)
    if (entity.age > 50) {
      rate *= Math.max(0.5, 1 - (entity.age - 50) * 0.01);
    }

    // 학습 수정자 적용
    const modifiers = this.learningModifiers.get(entity.id);
    if (modifiers) {
      for (const modifier of modifiers) {
        if (modifier.type === 'bonus') {
          rate += modifier.value;
        } else {
          rate -= modifier.value;
        }
      }
    }

    return Math.max(0.1, rate);
  }

  // 지식 획득
  private acquireKnowledge(entity: Entity, intensity: number): void {
    const knowledgeChance = 0.3 * intensity;
    
    if (this.rng.bool(knowledgeChance)) {
      const knowledgeId = `knowledge_${Date.now()}_${this.rng.range(1000, 9999)}`;
      const knowledgeValue = Math.min(1, this.rng.range(0.1, 0.5) * intensity);
      
      entity.knowledge[knowledgeId] = knowledgeValue;
      
      this.logger.success('learning', `${entity.name}이(가) 새로운 지식을 발견했습니다!`, entity.id, entity.name, {
        knowledgeId,
        value: knowledgeValue
      });
    }
  }

  // 학습 경험 기록
  private recordLearningExperience(entity: Entity, action: string, gain: number, success: boolean): void {
    const experience: LearningExperience = {
      id: `exp_${Date.now()}_${this.rng.range(1000, 9999)}`,
      type: 'skill',
      target: this.mapActionToSkill(action) || 'unknown',
      value: gain,
      timestamp: Date.now(),
      description: `${action} 행동을 통해 ${gain.toFixed(2)} 경험을 획득했습니다.`
    };

    // 엔티티에 학습 경험 저장 (실제로는 별도 저장소에 저장할 수 있음)
    if (!entity.learningExperiences) {
      entity.learningExperiences = [];
    }
    entity.learningExperiences.push(experience);
  }

  // 가르치기 시작
  startTeaching(teacher: Entity, student: Entity, subject: SkillKey | KnowledgeId): boolean {
    // 가르치기 조건 체크
    if (teacher.id === student.id) return false;
    if (teacher.stamina < 20 || student.stamina < 20) return false;
    if (teacher.hp <= 0 || student.hp <= 0) return false;

    // 교사가 해당 분야에 능숙한지 확인
    let teacherExpertise = 0;
    if (this.isSkillKey(subject)) {
      teacherExpertise = teacher.skills[subject];
    } else {
      teacherExpertise = teacher.knowledge[subject] * 100;
    }

    if (teacherExpertise < 30) {
      this.logger.warning('learning', `${teacher.name}은(는) ${subject}에 대해 충분히 숙련되지 않았습니다.`, teacher.id, teacher.name);
      return false;
    }

    // 가르치기 세션 생성
    const sessionId = `${teacher.id}_${student.id}_${subject}`;
    const effectiveness = this.calculateTeachingEffectiveness(teacher, student, subject);
    
    const session: TeachingSession = {
      teacher,
      student,
      subject,
      effectiveness,
      duration: 0
    };

    this.teachingSessions.set(sessionId, session);

    this.logger.info('learning', `${teacher.name}이(가) ${student.name}에게 ${subject}를 가르치기 시작했습니다.`, teacher.id, teacher.name, {
      student: student.name,
      subject,
      effectiveness: effectiveness.toFixed(2)
    });

    return true;
  }

  // 가르치기 효과 계산
  private calculateTeachingEffectiveness(teacher: Entity, student: Entity, subject: SkillKey | KnowledgeId): number {
    let effectiveness = 0.5; // 기본 효과

    // 교사의 숙련도
    let teacherExpertise = 0;
    if (this.isSkillKey(subject)) {
      teacherExpertise = teacher.skills[subject];
    } else {
      teacherExpertise = teacher.knowledge[subject] * 100;
    }
    effectiveness += teacherExpertise * 0.005;

    // 교사의 매력 (설명 능력)
    effectiveness += teacher.stats.cha * 0.002;

    // 학생의 지능 (이해력)
    effectiveness += student.stats.int * 0.003;

    // 학생의 현재 숙련도 (낮을수록 더 많이 배움)
    let studentCurrent = 0;
    if (this.isSkillKey(subject)) {
      studentCurrent = student.skills[subject];
    } else {
      studentCurrent = student.knowledge[subject] * 100;
    }
    effectiveness += (100 - studentCurrent) * 0.002;

    return Math.max(0.1, Math.min(1.0, effectiveness));
  }

  // 타입 가드
  private isSkillKey(value: string): value is SkillKey {
    return ['gather', 'analyze', 'craft', 'build', 'cook', 'combat', 'trade', 'lead'].includes(value);
  }

  // 가르치기 업데이트
  updateTeaching(): void {
    const completedSessions: string[] = [];

    for (const [sessionId, session] of this.teachingSessions) {
      session.duration += 1;

      // 가르치기 조건 체크
      if (session.teacher.stamina < 10 || session.student.stamina < 10 ||
          session.teacher.hp <= 0 || session.student.hp <= 0) {
        completedSessions.push(sessionId);
        continue;
      }

      // 스태미나 소모
      session.teacher.stamina -= 0.5;
      session.student.stamina -= 0.3;

      // 학습 진행
      if (session.duration % 10 === 0) { // 10틱마다 학습
        this.progressTeaching(session);
      }

      // 가르치기 완료 (30틱 후)
      if (session.duration >= 30) {
        completedSessions.push(sessionId);
        this.completeTeaching(session);
      }
    }

    // 완료된 세션 제거
    for (const sessionId of completedSessions) {
      this.teachingSessions.delete(sessionId);
    }
  }

  // 가르치기 진행
  private progressTeaching(session: TeachingSession): void {
    const { teacher, student, subject, effectiveness } = session;
    const learningGain = effectiveness * this.rng.range(0.5, 1.5);

    if (this.isSkillKey(subject)) {
      const oldSkill = student.skills[subject];
      student.skills[subject] = Math.min(100, oldSkill + learningGain);
      
      if (student.skills[subject] > oldSkill) {
        this.logger.info('learning', `${student.name}의 ${subject} 스킬이 향상되었습니다.`, student.id, student.name, {
          skill: subject,
          gain: learningGain.toFixed(2),
          newValue: student.skills[subject].toFixed(1)
        });
      }
    } else {
      const oldKnowledge = student.knowledge[subject] || 0;
      student.knowledge[subject] = Math.min(1, oldKnowledge + learningGain * 0.01);
      
      if (student.knowledge[subject] > oldKnowledge) {
        this.logger.info('learning', `${student.name}이(가) ${subject} 지식을 습득했습니다.`, student.id, student.name, {
          knowledge: subject,
          gain: (learningGain * 0.01).toFixed(3),
          newValue: student.knowledge[subject].toFixed(3)
        });
      }
    }
  }

  // 가르치기 완료
  private completeTeaching(session: TeachingSession): void {
    const { teacher, student, subject } = session;

    this.logger.success('learning', `${teacher.name}의 가르침으로 ${student.name}의 ${subject}이(가) 크게 향상되었습니다!`, student.id, student.name, {
      teacher: teacher.name,
      subject,
      finalGain: '완료'
    });

    // 교사 경험치 획득
    this.learnFromExperience(teacher, 'Teach', true, 2);
  }

  // 학습 수정자 추가
  addLearningModifier(entityId: string, modifier: LearningModifier): void {
    if (!this.learningModifiers.has(entityId)) {
      this.learningModifiers.set(entityId, []);
    }
    this.learningModifiers.get(entityId)!.push(modifier);
  }

  // 학습 수정자 제거
  removeLearningModifier(entityId: string, source: string): void {
    const modifiers = this.learningModifiers.get(entityId);
    if (modifiers) {
      const index = modifiers.findIndex(m => m.source === source);
      if (index !== -1) {
        modifiers.splice(index, 1);
      }
    }
  }

  // 학습 수정자 업데이트
  updateLearningModifiers(): void {
    for (const [entityId, modifiers] of this.learningModifiers) {
      for (let i = modifiers.length - 1; i >= 0; i--) {
        modifiers[i].duration -= 1;
        if (modifiers[i].duration <= 0) {
          modifiers.splice(i, 1);
        }
      }
    }
  }

  // 엔티티의 학습 상태 조회
  getLearningStatus(entity: Entity): {
    currentSessions: TeachingSession[];
    modifiers: LearningModifier[];
    recentExperiences: LearningExperience[];
  } {
    const currentSessions = Array.from(this.teachingSessions.values())
      .filter(session => session.teacher.id === entity.id || session.student.id === entity.id);
    
    const modifiers = this.learningModifiers.get(entity.id) || [];
    const recentExperiences = entity.learningExperiences?.slice(-5) || [];

    return {
      currentSessions,
      modifiers,
      recentExperiences
    };
  }

  // 학습 통계 조회
  getLearningStats(entity: Entity): {
    totalSkillGain: number;
    totalKnowledgeGain: number;
    teachingSessions: number;
    learningSessions: number;
  } {
    const experiences = entity.learningExperiences || [];
    const totalSkillGain = experiences
      .filter(exp => exp.type === 'skill')
      .reduce((sum, exp) => sum + exp.value, 0);
    
    const totalKnowledgeGain = experiences
      .filter(exp => exp.type === 'knowledge')
      .reduce((sum, exp) => sum + exp.value, 0);

    const teachingSessions = Array.from(this.teachingSessions.values())
      .filter(session => session.teacher.id === entity.id).length;
    
    const learningSessions = Array.from(this.teachingSessions.values())
      .filter(session => session.student.id === entity.id).length;

    return {
      totalSkillGain,
      totalKnowledgeGain,
      teachingSessions,
      learningSessions
    };
  }
} 