import { GameLog, LogLevel, LogCategory } from '../../types';
import { uuid } from './index';

export class Logger {
  private maxLogsPerCategory: number = 1000;
  private categoryLogs: Map<LogCategory, GameLog[]> = new Map();

  addLog(
    level: LogLevel,
    category: LogCategory,
    message: string,
    entityId?: string,
    entityName?: string,
    data?: any
  ): void {
    const log: GameLog = {
      id: uuid(),
      timestamp: Date.now(),
      level,
      category,
      message,
      entityId,
      entityName,
      data
    };

    // 분류별 로그 관리
    if (!this.categoryLogs.has(category)) {
      this.categoryLogs.set(category, []);
    }
    
    const categoryLogList = this.categoryLogs.get(category)!;
    categoryLogList.push(log);

    // 분류별 최대 로그 수 제한 (각 카테고리당 1000개)
    if (categoryLogList.length > this.maxLogsPerCategory) {
      categoryLogList.splice(0, categoryLogList.length - this.maxLogsPerCategory);
    }
  }

  getLogs(): GameLog[] {
    // 모든 카테고리의 로그를 합쳐서 반환
    const allLogs: GameLog[] = [];
    for (const logs of this.categoryLogs.values()) {
      allLogs.push(...logs);
    }
    // 시간순으로 정렬
    return allLogs.sort((a, b) => a.timestamp - b.timestamp);
  }

  getLogsByCategory(category: LogCategory): GameLog[] {
    return this.categoryLogs.get(category) || [];
  }

  getLogsByLevel(level: LogLevel): GameLog[] {
    const filteredLogs: GameLog[] = [];
    for (const logs of this.categoryLogs.values()) {
      filteredLogs.push(...logs.filter(log => log.level === level));
    }
    return filteredLogs.sort((a, b) => a.timestamp - b.timestamp);
  }

  clearLogs(): void {
    this.categoryLogs.clear();
  }

  // 카테고리별 로그 수 반환
  getLogCountByCategory(): Record<LogCategory, number> {
    const counts: Record<LogCategory, number> = {} as Record<LogCategory, number>;
    for (const [category, logs] of this.categoryLogs.entries()) {
      counts[category] = logs.length;
    }
    return counts;
  }

  // 전체 로그 수 반환
  getTotalLogCount(): number {
    let total = 0;
    for (const logs of this.categoryLogs.values()) {
      total += logs.length;
    }
    return total;
  }

  // 편의 메서드들
  info(category: LogCategory, message: string, entityId?: string, entityName?: string, data?: any): void {
    this.addLog('info', category, message, entityId, entityName, data);
  }

  warning(category: LogCategory, message: string, entityId?: string, entityName?: string, data?: any): void {
    this.addLog('warning', category, message, entityId, entityName, data);
  }

  error(category: LogCategory, message: string, entityId?: string, entityName?: string, data?: any): void {
    this.addLog('error', category, message, entityId, entityName, data);
  }

  success(category: LogCategory, message: string, entityId?: string, entityName?: string, data?: any): void {
    this.addLog('success', category, message, entityId, entityName, data);
  }
} 