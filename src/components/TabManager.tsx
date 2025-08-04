import React, { useState, useEffect } from 'react';
import { ResizablePanel } from './ResizablePanel';
import UnifiedPanel from './UnifiedPanel';
import { FactionPanel } from './FactionPanel';
import { GeneticsPanel } from './GeneticsPanel';
import { EcosystemPanel } from './EcosystemPanel';
import LogPanel from './LogPanel';
import { DetailModal } from './DetailModal';
import { StatsPanel } from './StatsPanel';
import { DataEditorPanel } from './DataEditorPanel';
import { SettingsPanel } from './SettingsPanel';
import ParameterPanel from './ParameterPanel';
import { WorldState, Entity, Material, Faction, Animal, Plant } from '../types';
import { PanelState, loadPanelSettings, savePanelSettings } from '../utils/panelStorage';

interface TabManagerProps {
  gameState: WorldState;
  onNewGame?: () => void;
  onLoadGame?: (savedState: WorldState) => void;
  onSaveGame?: () => void;
  onResetSettings?: () => void;
}



export const TabManager: React.FC<TabManagerProps> = ({ 
  gameState, 
  onNewGame, 
  onLoadGame, 
  onSaveGame, 
  onResetSettings 
}) => {
  const [panels, setPanels] = useState<Record<string, PanelState>>({
    unified: { isOpen: false, position: { x: 10, y: 10 }, size: { width: 500, height: 500 } },
    faction: { isOpen: false, position: { x: 370, y: 10 }, size: { width: 500, height: 500 } },
    genetics: { isOpen: false, position: { x: 730, y: 10 }, size: { width: 500, height: 500 } },
    ecosystem: { isOpen: false, position: { x: 10, y: 420 }, size: { width: 500, height: 500 } },
    stats: { isOpen: false, position: { x: 370, y: 420 }, size: { width: 500, height: 500 } },
    log: { isOpen: false, position: { x: 730, y: 420 }, size: { width: 500, height: 500 } },
    editor: { isOpen: false, position: { x: 10, y: 10 }, size: { width: 500, height: 500 } },
    settings: { isOpen: false, position: { x: 10, y: 10 }, size: { width: 500, height: 500 } },
    parameters: { isOpen: false, position: { x: 10, y: 10 }, size: { width: 500, height: 500 } }
  });

  // 모달 상태
  const [modalData, setModalData] = useState<Entity | Material | Faction | Animal | Plant | null>(null);
  const [modalType, setModalType] = useState<'entity' | 'material' | 'faction' | 'animal' | 'plant' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tabs = [
    { id: 'unified', name: '통합', icon: '📊' },
    { id: 'faction', name: '파벌', icon: '⚔️' },
    { id: 'genetics', name: '유전', icon: '🧬' },
    { id: 'ecosystem', name: '생태계', icon: '🌿' },
    { id: 'stats', name: '통계', icon: '📈' },
    { id: 'log', name: '로그', icon: '📝' },
    { id: 'editor', name: '편집', icon: '✏️' },
    { id: 'settings', name: '설정', icon: '⚙️' },
    { id: 'parameters', name: '파라미터', icon: '🔧' }
  ];

  const handleTabClick = (tabId: string) => {
    setPanels(prev => ({
      ...prev,
      [tabId]: {
        ...prev[tabId],
        isOpen: !prev[tabId].isOpen
      }
    }));
  };

  const handlePanelClose = (tabId: string) => {
    setPanels(prev => ({
      ...prev,
      [tabId]: {
        ...prev[tabId],
        isOpen: false
      }
    }));
  };

  const handlePanelDrag = (tabId: string, newPosition: { x: number; y: number }) => {
    setPanels(prev => ({
      ...prev,
      [tabId]: {
        ...prev[tabId],
        position: newPosition
      }
    }));
  };

  const handlePanelResize = (tabId: string, newSize: { width: number; height: number }) => {
    setPanels(prev => ({
      ...prev,
      [tabId]: {
        ...prev[tabId],
        size: newSize
      }
    }));
  };

  // 패널 설정 저장
  const savePanelState = (tabId: string) => {
    const panel = panels[tabId];
    if (panel) {
      savePanelSettings(tabId, {
        position: panel.position,
        size: panel.size
      });
    }
  };

  // 패널 설정 불러오기
  const loadPanelState = (tabId: string) => {
    const savedSettings = loadPanelSettings(tabId);
    if (savedSettings) {
      setPanels(prev => ({
        ...prev,
        [tabId]: {
          ...prev[tabId],
          position: savedSettings.position,
          size: savedSettings.size
        }
      }));
    }
  };

  // 컴포넌트 마운트 시 저장된 설정 불러오기
  useEffect(() => {
    const panelIds = ['unified', 'faction', 'genetics', 'ecosystem', 'stats', 'log', 'editor', 'settings'];
    panelIds.forEach(loadPanelState);
  }, []);

  // 모달 핸들러
  const openModal = (data: Entity | Material | Faction | Animal | Plant, type: 'entity' | 'material' | 'faction' | 'animal' | 'plant') => {
    setModalData(data);
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
    setModalType(null);
  };

  const renderPanel = (tabId: string) => {
    const panel = panels[tabId];
    if (!panel.isOpen) return null;

    const commonProps = {
      onClose: () => handlePanelClose(tabId),
      initialPosition: panel.position,
      initialSize: panel.size,
      onPositionChange: (newPosition: { x: number; y: number }) => {
        handlePanelDrag(tabId, newPosition);
        savePanelState(tabId);
      },
      onSizeChange: (newSize: { width: number; height: number }) => {
        handlePanelResize(tabId, newSize);
        savePanelState(tabId);
      }
    };

    switch (tabId) {
      case 'unified':
        return (
          <ResizablePanel title="통합 패널" {...commonProps}>
            <UnifiedPanel 
              materials={gameState.materials}
              entities={gameState.entities}
              onMaterialSelect={(material: Material) => {
                openModal(material, 'material');
              }}
              onEntitySelect={(entity: Entity) => {
                openModal(entity, 'entity');
              }}
            />
          </ResizablePanel>
        );

      case 'faction':
        return (
          <ResizablePanel title="파벌 패널" {...commonProps}>
            <FactionPanel 
              factions={gameState.factions}
              factionRelations={gameState.factionRelations}
              onFactionSelect={(faction: Faction) => {
                openModal(faction, 'faction');
              }}
            />
          </ResizablePanel>
        );

      case 'genetics':
        return (
          <ResizablePanel title="유전 패널" {...commonProps}>
            <GeneticsPanel 
              entities={gameState.entities}
              geneticTraits={[]}
              onEntitySelect={(entity: Entity) => {
                openModal(entity, 'entity');
              }}
            />
          </ResizablePanel>
        );

      case 'ecosystem':
        return (
          <ResizablePanel title="생태계 패널" {...commonProps}>
            <EcosystemPanel 
              animals={gameState.animals}
              plants={gameState.plants}
              pulses={gameState.pulses}
              biomes={gameState.biomes}
              onAnimalSelect={(animal: Animal) => {
                openModal(animal, 'animal');
              }}
              onPlantSelect={(plant: Plant) => {
                openModal(plant, 'plant');
              }}
            />
          </ResizablePanel>
        );

      case 'stats':
        return (
          <ResizablePanel title="통계 패널" {...commonProps}>
            <StatsPanel worldState={gameState} />
          </ResizablePanel>
        );

      case 'log':
        return (
          <ResizablePanel title="로그 패널" {...commonProps}>
            <LogPanel logs={gameState.logs} />
          </ResizablePanel>
        );

      case 'editor':
        return (
          <ResizablePanel title="데이터 편집 패널" {...commonProps}>
            <DataEditorPanel 
              worldState={gameState}
              onEntityUpdate={(entity) => {
                // 엔티티 업데이트 로직
                console.log('엔티티 업데이트:', entity);
              }}
              onAnimalUpdate={(animal) => {
                // 동물 업데이트 로직
                console.log('동물 업데이트:', animal);
              }}
              onPlantUpdate={(plant) => {
                // 식물 업데이트 로직
                console.log('식물 업데이트:', plant);
              }}
              onMaterialUpdate={(material) => {
                // 재료 업데이트 로직
                console.log('재료 업데이트:', material);
              }}
              onFactionUpdate={(faction) => {
                // 파벌 업데이트 로직
                console.log('파벌 업데이트:', faction);
              }}
              onEntityCreate={(entity) => {
                // 엔티티 생성 로직
                console.log('엔티티 생성:', entity);
              }}
              onAnimalCreate={(animal) => {
                // 동물 생성 로직
                console.log('동물 생성:', animal);
              }}
              onPlantCreate={(plant) => {
                // 식물 생성 로직
                console.log('식물 생성:', plant);
              }}
              onMaterialCreate={(material) => {
                // 재료 생성 로직
                console.log('재료 생성:', material);
              }}
              onFactionCreate={(faction) => {
                // 파벌 생성 로직
                console.log('파벌 생성:', faction);
              }}
            />
          </ResizablePanel>
        );

      case 'settings':
        return (
          <ResizablePanel title="설정 패널" {...commonProps}>
            <SettingsPanel 
              worldState={gameState}
              onNewGame={onNewGame || (() => {})}
              onLoadGame={onLoadGame || (() => {})}
              onSaveGame={onSaveGame || (() => {})}
              onResetSettings={onResetSettings || (() => {})}
            />
          </ResizablePanel>
        );

      case 'parameters':
        return (
          <ResizablePanel title="파라미터 패널" {...commonProps}>
            <ParameterPanel onClose={() => handlePanelClose('parameters')} />
          </ResizablePanel>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* 패널들 렌더링 */}
      {Object.keys(panels).map(tabId => (
        <div key={tabId}>
          {renderPanel(tabId)}
        </div>
      ))}

      {/* 상세 모달 */}
      <DetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        data={modalData}
        type={modalType}
      />

      {/* 하단 탭 바 */}
      <div className="tab-bar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${panels[tab.id].isOpen ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-name">{tab.name}</span>
          </button>
        ))}
      </div>
    </>
  );
}; 