export interface PanelSettings {
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface PanelState {
  isOpen: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

const STORAGE_KEY = 'edenforge_panel_settings';

export const savePanelSettings = (panelId: string, settings: PanelSettings): void => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const allSettings = existing ? JSON.parse(existing) : {};
    
    allSettings[panelId] = settings;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings));
  } catch (error) {
    console.error('패널 설정 저장 중 오류:', error);
  }
};

export const loadPanelSettings = (panelId: string): PanelSettings | null => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) return null;
    
    const allSettings = JSON.parse(existing);
    return allSettings[panelId] || null;
  } catch (error) {
    console.error('패널 설정 불러오기 중 오류:', error);
    return null;
  }
};

export const loadAllPanelSettings = (): Record<string, PanelSettings> => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    return existing ? JSON.parse(existing) : {};
  } catch (error) {
    console.error('모든 패널 설정 불러오기 중 오류:', error);
    return {};
  }
};

export const clearPanelSettings = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('패널 설정 삭제 중 오류:', error);
  }
}; 