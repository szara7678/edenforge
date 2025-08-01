import { Entity, Vec2 } from '../types';
import { RNG } from './utils';
import { Logger } from './utils/logger';

export interface CombatResult {
  winner: Entity;
  loser: Entity;
  damage: number;
  experience: number;
}

export interface Weapon {
  id: string;
  name: string;
  damage: number;
  accuracy: number;
  durability: number;
  maxDurability: number;
}

export interface Armor {
  id: string;
  name: string;
  defense: number;
  durability: number;
  maxDurability: number;
}

export class CombatSystem {
  private logger: Logger;
  private rng: RNG;

  constructor(logger: Logger) {
    this.logger = logger;
    this.rng = new RNG();
  }

  // 전투 가능한 엔티티 찾기
  findCombatTargets(attacker: Entity, entities: Entity[], maxDistance: number = 50): Entity[] {
    return entities.filter(entity => 
      entity.id !== attacker.id && 
      entity.hp > 0 &&
      this.calculateDistance(attacker.pos, entity.pos) <= maxDistance
    );
  }

  // 거리 계산
  private calculateDistance(pos1: Vec2, pos2: Vec2): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // 전투 실행
  executeCombat(attacker: Entity, defender: Entity): CombatResult | null {
    // 기본 전투 조건 체크
    if (attacker.hp <= 0 || defender.hp <= 0) return null;
    if (attacker.stamina < 20) return null;

    // 전투 스킬 계산
    const attackerCombatSkill = attacker.skills.combat;
    const defenderCombatSkill = defender.skills.combat;

    // 무기/방어구 효과
    const attackerWeapon = this.getBestWeapon(attacker);
    const defenderArmor = this.getBestArmor(defender);

    // 공격력 계산
    const attackPower = attackerCombatSkill + (attackerWeapon?.damage || 0) + attacker.stats.str * 0.5;
    const defensePower = defenderCombatSkill + (defenderArmor?.defense || 0) + defender.stats.end * 0.5;

    // 명중률 계산
    const accuracy = 0.6 + (attackerWeapon?.accuracy || 0) + attackerCombatSkill * 0.01;
    const hit = this.rng.bool(accuracy);

    if (!hit) {
      // 공격 실패
      attacker.stamina -= 10;
      this.logger.warning('combat', `${attacker.name}의 공격이 빗나갔습니다.`, attacker.id, attacker.name);
      return null;
    }

    // 데미지 계산
    const baseDamage = attackPower - defensePower * 0.5;
    const damage = Math.max(5, Math.floor(baseDamage + this.rng.range(-5, 10)));
    
    // 크리티컬 히트 (10% 확률)
    const isCritical = this.rng.bool(0.1);
    const finalDamage = isCritical ? damage * 2 : damage;

    // 데미지 적용
    defender.hp = Math.max(0, defender.hp - finalDamage);
    attacker.stamina -= 15;

    // 경험치 획득
    const experience = Math.floor(damage * 0.5);
    attacker.skills.combat = Math.min(100, attacker.skills.combat + experience * 0.1);

    // 전투 결과 로그
    if (isCritical) {
      this.logger.success('combat', `${attacker.name}이(가) ${defender.name}에게 크리티컬 히트! ${finalDamage} 데미지!`, attacker.id, attacker.name, { damage: finalDamage, target: defender.name });
    } else {
      this.logger.success('combat', `${attacker.name}이(가) ${defender.name}에게 ${finalDamage} 데미지를 입혔습니다.`, attacker.id, attacker.name, { damage: finalDamage, target: defender.name });
    }

    // 사망 체크
    if (defender.hp <= 0) {
      const deathInfo = {
        killer: attacker.name,
        killerId: attacker.id,
        weapon: this.getBestWeapon(attacker)?.name || '맨손',
        damage: finalDamage,
        isCritical,
        defenderStats: {
          hp: defender.hp,
          combat: defender.skills.combat,
          defense: this.getBestArmor(defender)?.defense || 0
        }
      };
      
      this.logger.error('combat', `${defender.name}이(가) ${attacker.name}의 공격으로 전투에서 사망했습니다.`, defender.id, defender.name, deathInfo);
      
      return {
        winner: attacker,
        loser: defender,
        damage: finalDamage,
        experience: experience * 2
      };
    }

    return {
      winner: attacker,
      loser: defender,
      damage: finalDamage,
      experience: experience
    };
  }

  // 최고 무기 찾기
  private getBestWeapon(entity: Entity): Weapon | null {
    const weapons = entity.inventory.items;
    let bestWeapon: Weapon | null = null;
    let bestDamage = 0;

    // 간단한 무기 시스템 (실제로는 더 복잡할 수 있음)
    if (weapons['도구'] && weapons['도구'] > 0) {
      bestWeapon = { id: 'tool', name: '도구', damage: 5, accuracy: 0.7, durability: 100, maxDurability: 100 };
      bestDamage = 5;
    }
    if (weapons['무기'] && weapons['무기'] > 0) {
      const weapon = { id: 'weapon', name: '무기', damage: 10, accuracy: 0.8, durability: 100, maxDurability: 100 };
      if (weapon.damage > bestDamage) {
        bestWeapon = weapon;
        bestDamage = weapon.damage;
      }
    }

    return bestWeapon;
  }

  // 최고 방어구 찾기
  private getBestArmor(entity: Entity): Armor | null {
    const armors = entity.inventory.items;
    let bestArmor: Armor | null = null;


    if (armors['방어구'] && armors['방어구'] > 0) {
      bestArmor = { id: 'armor', name: '방어구', defense: 8, durability: 100, maxDurability: 100 };
    }

    return bestArmor;
  }

  // 전투 가능성 평가
  evaluateCombatChance(attacker: Entity, defender: Entity): number {
    const attackerPower = attacker.skills.combat + attacker.stats.str * 0.5;
    const defenderPower = defender.skills.combat + defender.stats.end * 0.5;
    
    return Math.max(0.1, Math.min(0.9, attackerPower / (attackerPower + defenderPower)));
  }

  // 전투 의사결정
  shouldInitiateCombat(attacker: Entity, defender: Entity): boolean {
    // 기본 조건
    if (attacker.hp < 30 || attacker.stamina < 20) return false;
    if (defender.hp < 10) return false; // 약한 상대만 공격

    // 전투 확률 계산
    const combatChance = this.evaluateCombatChance(attacker, defender);
    const aggression = attacker.genes.survival; // 생존 본능이 높을수록 공격적

    return this.rng.bool(combatChance * aggression);
  }

  // 전투 후처리
  handleCombatAftermath(result: CombatResult): void {
    const { winner, loser, experience } = result;

    // 승자 경험치 획득
    winner.skills.combat = Math.min(100, winner.skills.combat + experience * 0.1);
    winner.morale = Math.min(100, winner.morale + 10);

    // 패자 처리
    if (loser.hp <= 0) {
      // 사망 처리 (이미 executeCombat에서 처리됨)
      const injuryInfo = {
        damage: result.damage,
        finalHp: loser.hp,
        moraleLoss: 20,
        experience: result.experience
      };
      
      this.logger.error('combat', `${loser.name}이(가) 전투에서 치명상을 입고 사망했습니다.`, loser.id, loser.name, injuryInfo);
    } else {
      // 부상 처리
      loser.morale = Math.max(0, loser.morale - 20);
      const injuryInfo = {
        damage: result.damage,
        remainingHp: loser.hp,
        moraleLoss: 20,
        experience: result.experience
      };
      
      this.logger.warning('combat', `${loser.name}이(가) 전투에서 부상을 입었습니다. (남은 HP: ${loser.hp.toFixed(1)})`, loser.id, loser.name, injuryInfo);
    }
  }
} 