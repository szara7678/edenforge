import { RNG } from './index';

export class FactionNameGenerator {
  private rng: RNG;
  
  // 파벌 이름 구성 요소
  private adjectives = [
    '붉은', '푸른', '검은', '흰', '황금', '은빛', '동빛', '보라', '초록', '주황',
    '강한', '약한', '빠른', '느린', '큰', '작은', '높은', '낮은', '깊은', '얕은',
    '오래된', '새로운', '고대의', '현대의', '신비로운', '평범한', '특별한', '일반적인',
    '용감한', '겁많은', '현명한', '어리석은', '친절한', '냉혹한', '정직한', '교활한',
    '고귀한', '천한', '부유한', '가난한', '강력한', '약한', '영리한', '순수한'
  ];
  
  private nouns = [
    '용', '늑대', '사자', '독수리', '호랑이', '곰', '여우', '늑대', '사슴', '토끼',
    '뱀', '독사', '매', '부엉이', '까마귀', '참새', '제비', '비둘기', '까치', '까마귀',
    '검', '창', '활', '방패', '갑옷', '투구', '장갑', '신발', '망토', '로브',
    '나무', '돌', '강', '바다', '산', '평원', '숲', '사막', '늪', '호수',
    '불', '물', '바람', '땅', '번개', '구름', '비', '눈', '안개', '무지개',
    '별', '달', '해', '우주', '은하', '성운', '혜성', '운석', '행성', '위성',
    '왕', '여왕', '공작', '공작부인', '백작', '백작부인', '자작', '자작부인', '남작', '남작부인',
    '기사', '기사단', '전사', '마법사', '사제', '도적', '상인', '농부', '장인', '학자',
    '성', '탑', '요새', '사원', '궁전', '저택', '오두막', '집', '다리', '문',
    '길', '거리', '시장', '광장', '공원', '정원', '농장', '광산', '공장', '창고',
    '배', '배', '배', '배', '배', '배', '배', '배', '배', '배'
  ];
  
  private suffixes = [
    '단', '회', '동맹', '연합', '제국', '왕국', '공국', '백국', '자국', '남국',
    '군', '대', '단', '파', '당', '회', '사', '조', '단', '파',
    '의', '의', '의', '의', '의', '의', '의', '의', '의', '의',
    '들', '들', '들', '들', '들', '들', '들', '들', '들', '들'
  ];
  
  constructor() {
    this.rng = new RNG();
  }

  // 랜덤한 파벌 이름 생성
  generateFactionName(): string {
    const nameType = this.rng.range(0, 4);
    
    switch (nameType) {
      case 0:
        return this.generateAdjectiveNounName();
      case 1:
        return this.generateNounSuffixName();
      case 2:
        return this.generateCompoundName();
      case 3:
        return this.generateSimpleName();
      default:
        return this.generateAdjectiveNounName();
    }
  }

  // 형용사 + 명사 조합
  private generateAdjectiveNounName(): string {
    const adjective = this.rng.choice(this.adjectives);
    const noun = this.rng.choice(this.nouns);
    return `${adjective} ${noun}`;
  }

  // 명사 + 접미사 조합
  private generateNounSuffixName(): string {
    const noun = this.rng.choice(this.nouns);
    const suffix = this.rng.choice(this.suffixes);
    return `${noun}${suffix}`;
  }

  // 복합형 이름
  private generateCompoundName(): string {
    const adjective1 = this.rng.choice(this.adjectives);
    const adjective2 = this.rng.choice(this.adjectives);
    const noun = this.rng.choice(this.nouns);
    return `${adjective1} ${adjective2} ${noun}`;
  }

  // 간단한 이름
  private generateSimpleName(): string {
    const noun = this.rng.choice(this.nouns);
    return `${noun}`;
  }

  // 특정 테마의 파벌 이름 생성
  generateThemedFactionName(theme: 'military' | 'trade' | 'magic' | 'nature' | 'noble'): string {
    const themedAdjectives: Record<string, string[]> = {
      military: ['강한', '용감한', '무서운', '정예', '정복', '전쟁', '군사', '방어', '공격', '전략'],
      trade: ['부유한', '상업', '무역', '교역', '상인', '거래', '경제', '재정', '금융', '투자'],
      magic: ['신비로운', '마법', '주술', '마법사', '사제', '신성', '신비', '주문', '마법', '주술'],
      nature: ['자연', '생명', '평화', '숲', '강', '산', '바다', '대지', '하늘', '별'],
      noble: ['고귀한', '왕족', '귀족', '고급', '우아한', '세련된', '고전', '전통', '문화', '예술']
    };
    
    const themedNouns: Record<string, string[]> = {
      military: ['기사', '전사', '군대', '부대', '기사단', '방패', '검', '창', '갑옷', '요새'],
      trade: ['상인', '상회', '무역', '거래', '시장', '상점', '은행', '창고', '항구', '도시'],
      magic: ['마법사', '사제', '주술사', '마법', '주문', '신성', '신비', '마법', '주술', '사원'],
      nature: ['드루이드', '수호자', '보호자', '자연', '생명', '숲', '강', '산', '바다', '대지'],
      noble: ['왕', '여왕', '공작', '백작', '자작', '남작', '기사', '귀족', '왕족', '궁전']
    };
    
    const adjectives = themedAdjectives[theme] || this.adjectives;
    const nouns = themedNouns[theme] || this.nouns;
    
    const adjective = this.rng.choice(adjectives);
    const noun = this.rng.choice(nouns);
    
    return `${adjective} ${noun}`;
  }
} 