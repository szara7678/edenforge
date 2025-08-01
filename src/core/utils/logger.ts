import { GameLog, LogLevel, LogCategory } from '../../types';
import { uuid } from './index';

export class Logger {
  private logs: GameLog[] = [];
  private maxLogs: number = 1000;

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

    this.logs.push(log);

    // 최대 로그 수 제한
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  getLogs(): GameLog[] {
    return [...this.logs];
  }

  getLogsByCategory(category: LogCategory): GameLog[] {
    return this.logs.filter(log => log.category === category);
  }

  getLogsByLevel(level: LogLevel): GameLog[] {
    return this.logs.filter(log => log.level === level);
  }

  clearLogs(): void {
    this.logs = [];
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