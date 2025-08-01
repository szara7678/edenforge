import React, { useState } from 'react';
import { DraggablePanel } from './DraggablePanel';
import UnifiedPanel from './UnifiedPanel';
import { FactionPanel } from './FactionPanel';
import { GeneticsPanel } from './GeneticsPanel';
import { EcosystemPanel } from './EcosystemPanel';
import LogPanel from './LogPanel';
import { DetailModal } from './DetailModal';
import { WorldState, Entity, Material, Faction, Animal, Plant } from '../types';

interface TabManagerProps {
  gameState: WorldState;
}

interface PanelState {
  isOpen: boolean;
  position: { x: number; y: number };
}

export const TabManager: React.FC<TabManagerProps> = ({ gameState }) => {
  const [panels, setPanels] = useState<Record<string, PanelState>>({
    unified: { isOpen: false, position: { x: 10, y: 10 } },
    faction: { isOpen: false, position: { x: 370, y: 10 } },
    genetics: { isOpen: false, position: { x: 730, y: 10 } },
    ecosystem: { isOpen: false, position: { x: 10, y: 420 } },
    log: { isOpen: false, position: { x: 370, y: 420 } }
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
    { id: 'log', name: '로그', icon: '📝' }
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
      width: 350,
      height: 400,
      onPositionChange: (newPosition: { x: number; y: number }) => handlePanelDrag(tabId, newPosition)
    };

    switch (tabId) {
      case 'unified':
        return (
          <DraggablePanel title="통합 패널" {...commonProps}>
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
          </DraggablePanel>
        );

      case 'faction':
        return (
          <DraggablePanel title="파벌 패널" {...commonProps}>
            <FactionPanel 
              factions={gameState.factions}
              factionRelations={gameState.factionRelations}
              entities={gameState.entities}
              onFactionSelect={(faction: Faction) => {
                openModal(faction, 'faction');
              }}
            />
          </DraggablePanel>
        );

      case 'genetics':
        return (
          <DraggablePanel title="유전 패널" {...commonProps}>
            <GeneticsPanel 
              entities={gameState.entities}
              geneticTraits={[]}
              onEntitySelect={(entity: Entity) => {
                openModal(entity, 'entity');
              }}
            />
          </DraggablePanel>
        );

      case 'ecosystem':
        return (
          <DraggablePanel title="생태계 패널" {...commonProps}>
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
          </DraggablePanel>
        );

      case 'log':
        return (
          <DraggablePanel title="로그 패널" {...commonProps}>
            <LogPanel logs={gameState.logs} />
          </DraggablePanel>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* 패널들 렌더링 */}
      {Object.keys(panels).map(tabId => renderPanel(tabId))}

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