import { RNG } from './index';

export class NameGenerator {
  private rng: RNG;
  
  // 알파벳 조합을 위한 문자들
  private consonants = 'bcdfghjklmnpqrstvwxz';
  private vowels = 'aeiouy';
  private specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  private numbers = '0123456789';
  
  constructor() {
    this.rng = new RNG();
  }

  // 랜덤한 이름 생성
  generateName(): string {
    const nameType = this.rng.range(0, 4);
    
    switch (nameType) {
      case 0:
        return this.generateAlphabeticName();
      case 1:
        return this.generateAlphanumericName();
      case 2:
        return this.generateSymbolicName();
      case 3:
        return this.generateMixedName();
      default:
        return this.generateAlphabeticName();
    }
  }

  // 알파벳 기반 이름
  private generateAlphabeticName(): string {
    const length = this.rng.range(3, 8);
    let name = '';
    
    for (let i = 0; i < length; i++) {
      if (i === 0) {
        // 첫 글자는 자음 또는 모음
        name += this.rng.choice(this.consonants + this.vowels).toUpperCase();
      } else {
        // 나머지는 자음 또는 모음
        name += this.rng.choice(this.consonants + this.vowels);
      }
    }
    
    return name;
  }

  // 알파벳 + 숫자 이름
  private generateAlphanumericName(): string {
    const length = this.rng.range(4, 10);
    let name = '';
    
    for (let i = 0; i < length; i++) {
      if (i === 0) {
        name += this.rng.choice(this.consonants + this.vowels).toUpperCase();
      } else {
        name += this.rng.choice(this.consonants + this.vowels + this.numbers);
      }
    }
    
    return name;
  }

  // 특수문자 포함 이름
  private generateSymbolicName(): string {
    const length = this.rng.range(3, 7);
    let name = '';
    
    for (let i = 0; i < length; i++) {
      if (i === 0) {
        name += this.rng.choice(this.consonants + this.vowels).toUpperCase();
      } else {
        name += this.rng.choice(this.consonants + this.vowels + this.specialChars);
      }
    }
    
    return name;
  }

  // 혼합형 이름
  private generateMixedName(): string {
    const patterns = [
      () => `${this.rng.choice(this.consonants).toUpperCase()}${this.rng.choice(this.vowels)}${this.rng.choice(this.numbers)}${this.rng.choice(this.specialChars)}`,
      () => `${this.rng.choice(this.vowels).toUpperCase()}${this.rng.choice(this.consonants)}${this.rng.choice(this.numbers)}`,
      () => `${this.rng.choice(this.consonants).toUpperCase()}${this.rng.choice(this.vowels)}${this.rng.choice(this.specialChars)}${this.rng.choice(this.numbers)}`,
      () => `${this.rng.choice(this.specialChars)}${this.rng.choice(this.consonants).toUpperCase()}${this.rng.choice(this.vowels)}${this.rng.choice(this.numbers)}`
    ];
    
    return patterns[this.rng.range(0, patterns.length)]();
  }

  // 특정 종족에 맞는 이름 생성
  generateSpeciesName(species: string): string {
    const baseName = this.generateName();
    
    // 종족별 접두사/접미사 추가
    const prefixes: Record<string, string[]> = {
      human: ['H', 'A', 'Z', 'X', 'Q'],
      wolf: ['W', 'L', 'F', 'D'],
      bear: ['B', 'G', 'M', 'K'],
      deer: ['D', 'E', 'R', 'N'],
      rabbit: ['R', 'B', 'T', 'H'],
      fox: ['F', 'X', 'V', 'S']
    };
    
    const suffixes: Record<string, string[]> = {
      human: ['x', 'z', 'q', 'k', '!'],
      wolf: ['f', 'l', 'w', 'd'],
      bear: ['r', 'g', 'm', 'k'],
      deer: ['r', 'n', 'e', 'd'],
      rabbit: ['t', 'b', 'h', 'p'],
      fox: ['x', 'f', 'v', 's']
    };
    
    const prefix = prefixes[species] ? this.rng.choice(prefixes[species]) : '';
    const suffix = suffixes[species] ? this.rng.choice(suffixes[species]) : '';
    
    return `${prefix}${baseName}${suffix}`;
  }
} 