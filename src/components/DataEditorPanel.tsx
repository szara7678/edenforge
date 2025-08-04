import React, { useState } from 'react';
import { WorldState, Entity, Animal, Plant, Material, Faction } from '../types';

interface DataEditorPanelProps {
  worldState: WorldState;
  onEntityUpdate?: (entity: Entity) => void;
  onAnimalUpdate?: (animal: Animal) => void;
  onPlantUpdate?: (plant: Plant) => void;
  onMaterialUpdate?: (material: Material) => void;
  onFactionUpdate?: (faction: Faction) => void;
  onEntityCreate?: (entity: Entity) => void;
  onAnimalCreate?: (animal: Animal) => void;
  onPlantCreate?: (plant: Plant) => void;
  onMaterialCreate?: (material: Material) => void;
  onFactionCreate?: (faction: Faction) => void;
}

export const DataEditorPanel: React.FC<DataEditorPanelProps> = ({
  worldState,
  onEntityUpdate,
  onAnimalUpdate,
  onPlantUpdate,
  onMaterialUpdate,
  onFactionUpdate,
  onEntityCreate,
  onAnimalCreate,
  onPlantCreate,
  onMaterialCreate,
  onFactionCreate
}) => {
  const [activeTab, setActiveTab] = useState<'entities' | 'animals' | 'plants' | 'materials' | 'factions'>('entities');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const tabs = [
    { id: 'entities', name: '엔티티', icon: '👤', count: worldState.entities.length },
    { id: 'animals', name: '동물', icon: '🐾', count: worldState.animals.length },
    { id: 'plants', name: '식물', icon: '🌿', count: worldState.plants.length },
    { id: 'materials', name: '재료', icon: '🔧', count: worldState.materials.length },
    { id: 'factions', name: '파벌', icon: '⚔️', count: worldState.factions.length }
  ];

  const renderEntityEditor = () => (
    <div className="data-editor-content">
      <div className="editor-header">
        <h3>엔티티 편집</h3>
        <div className="editor-header-actions">
          <button 
            className="create-btn"
            onClick={() => {
              setIsCreating(true);
              setSelectedItem(null);
            }}
          >
            + 새 엔티티
          </button>
          {(isEditing || isCreating) && (
            <button 
              className="back-btn"
              onClick={() => {
                setIsEditing(false);
                setIsCreating(false);
                setSelectedItem(null);
              }}
            >
              ← 뒤로
            </button>
          )}
        </div>
      </div>
      
      <div className="item-list">
        {worldState.entities.map(entity => (
          <div 
            key={entity.id} 
            className={`item-item ${selectedItem?.id === entity.id ? 'selected' : ''}`}
            onClick={() => {
              setSelectedItem(entity);
              setIsEditing(true);
              setIsCreating(false);
            }}
          >
            <div className="item-name">{entity.name}</div>
            <div className="item-details">
              <span>HP: {entity.hp}</span>
              <span>나이: {entity.age}</span>
              <span>종족: {entity.species}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && isEditing && (
        <div className="editor-form">
          <h4>엔티티 수정</h4>
          <EntityForm 
            entity={selectedItem}
            onSave={(updatedEntity) => {
              onEntityUpdate?.(updatedEntity);
              setIsEditing(false);
              setSelectedItem(null);
            }}
            onCancel={() => {
              setIsEditing(false);
              setSelectedItem(null);
            }}
          />
        </div>
      )}

      {isCreating && (
        <div className="editor-form">
          <h4>새 엔티티 생성</h4>
          <EntityForm 
            entity={null}
            onSave={(newEntity) => {
              onEntityCreate?.(newEntity);
              setIsCreating(false);
            }}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}
    </div>
  );

  const renderAnimalEditor = () => (
    <div className="data-editor-content">
      <div className="editor-header">
        <h3>동물 편집</h3>
        <div className="editor-header-actions">
          <button 
            className="create-btn"
            onClick={() => {
              setIsCreating(true);
              setSelectedItem(null);
            }}
          >
            + 새 동물
          </button>
          {(isEditing || isCreating) && (
            <button 
              className="back-btn"
              onClick={() => {
                setIsEditing(false);
                setIsCreating(false);
                setSelectedItem(null);
              }}
            >
              ← 뒤로
            </button>
          )}
        </div>
      </div>
      
      <div className="item-list">
        {worldState.animals.map(animal => (
          <div 
            key={animal.id} 
            className={`item-item ${selectedItem?.id === animal.id ? 'selected' : ''}`}
            onClick={() => {
              setSelectedItem(animal);
              setIsEditing(true);
              setIsCreating(false);
            }}
          >
            <div className="item-name">{animal.name}</div>
            <div className="item-details">
              <span>HP: {animal.hp}</span>
              <span>종: {animal.species}</span>
              <span>크기: {animal.size}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && isEditing && (
        <div className="editor-form">
          <h4>동물 수정</h4>
          <AnimalForm 
            animal={selectedItem}
            onSave={(updatedAnimal) => {
              onAnimalUpdate?.(updatedAnimal);
              setIsEditing(false);
              setSelectedItem(null);
            }}
            onCancel={() => {
              setIsEditing(false);
              setSelectedItem(null);
            }}
          />
        </div>
      )}

      {isCreating && (
        <div className="editor-form">
          <h4>새 동물 생성</h4>
          <AnimalForm 
            animal={null}
            onSave={(newAnimal) => {
              onAnimalCreate?.(newAnimal);
              setIsCreating(false);
            }}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}
    </div>
  );

  const renderPlantEditor = () => (
    <div className="data-editor-content">
      <div className="editor-header">
        <h3>식물 편집</h3>
        <div className="editor-header-actions">
          <button 
            className="create-btn"
            onClick={() => {
              setIsCreating(true);
              setSelectedItem(null);
            }}
          >
            + 새 식물
          </button>
          {(isEditing || isCreating) && (
            <button 
              className="back-btn"
              onClick={() => {
                setIsEditing(false);
                setIsCreating(false);
                setSelectedItem(null);
              }}
            >
              ← 뒤로
            </button>
          )}
        </div>
      </div>
      
      <div className="item-list">
        {worldState.plants.map(plant => (
          <div 
            key={plant.id} 
            className={`item-item ${selectedItem?.id === plant.id ? 'selected' : ''}`}
            onClick={() => {
              setSelectedItem(plant);
              setIsEditing(true);
              setIsCreating(false);
            }}
          >
            <div className="item-name">{plant.name}</div>
            <div className="item-details">
              <span>성장: {plant.growth}</span>
              <span>종: {plant.species}</span>
              <span>수확량: {plant.yield}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && isEditing && (
        <div className="editor-form">
          <h4>식물 수정</h4>
          <PlantForm 
            plant={selectedItem}
            onSave={(updatedPlant) => {
              onPlantUpdate?.(updatedPlant);
              setIsEditing(false);
              setSelectedItem(null);
            }}
            onCancel={() => {
              setIsEditing(false);
              setSelectedItem(null);
            }}
          />
        </div>
      )}

      {isCreating && (
        <div className="editor-form">
          <h4>새 식물 생성</h4>
          <PlantForm 
            plant={null}
            onSave={(newPlant) => {
              onPlantCreate?.(newPlant);
              setIsCreating(false);
            }}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}
    </div>
  );

  const renderMaterialEditor = () => (
    <div className="data-editor-content">
      <div className="editor-header">
        <h3>재료 편집</h3>
        <div className="editor-header-actions">
          <button 
            className="create-btn"
            onClick={() => {
              setIsCreating(true);
              setSelectedItem(null);
            }}
          >
            + 새 재료
          </button>
          {(isEditing || isCreating) && (
            <button 
              className="back-btn"
              onClick={() => {
                setIsEditing(false);
                setIsCreating(false);
                setSelectedItem(null);
              }}
            >
              ← 뒤로
            </button>
          )}
        </div>
      </div>
      
      <div className="item-list">
        {worldState.materials.map(material => (
          <div 
            key={material.id} 
            className={`item-item ${selectedItem?.id === material.id ? 'selected' : ''}`}
            onClick={() => {
              setSelectedItem(material);
              setIsEditing(true);
              setIsCreating(false);
            }}
          >
            <div className="item-name">{material.name}</div>
            <div className="item-details">
              <span>티어: {material.tier}</span>
              <span>속성: {Object.keys(material.props).length}개</span>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && isEditing && (
        <div className="editor-form">
          <h4>재료 수정</h4>
          <MaterialForm 
            material={selectedItem}
            onSave={(updatedMaterial) => {
              onMaterialUpdate?.(updatedMaterial);
              setIsEditing(false);
              setSelectedItem(null);
            }}
            onCancel={() => {
              setIsEditing(false);
              setSelectedItem(null);
            }}
          />
        </div>
      )}

      {isCreating && (
        <div className="editor-form">
          <h4>새 재료 생성</h4>
          <MaterialForm 
            material={null}
            onSave={(newMaterial) => {
              onMaterialCreate?.(newMaterial);
              setIsCreating(false);
            }}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}
    </div>
  );

  const renderFactionEditor = () => (
    <div className="data-editor-content">
      <div className="editor-header">
        <h3>파벌 편집</h3>
        <div className="editor-header-actions">
          <button 
            className="create-btn"
            onClick={() => {
              setIsCreating(true);
              setSelectedItem(null);
            }}
          >
            + 새 파벌
          </button>
          {(isEditing || isCreating) && (
            <button 
              className="back-btn"
              onClick={() => {
                setIsEditing(false);
                setIsCreating(false);
                setSelectedItem(null);
              }}
            >
              ← 뒤로
            </button>
          )}
        </div>
      </div>
      
      <div className="item-list">
        {worldState.factions.map(faction => (
          <div 
            key={faction.id} 
            className={`item-item ${selectedItem?.id === faction.id ? 'selected' : ''}`}
            onClick={() => {
              setSelectedItem(faction);
              setIsEditing(true);
              setIsCreating(false);
            }}
          >
            <div className="item-name">{faction.name}</div>
            <div className="item-details">
              <span>멤버: {faction.members.length}</span>
              <span>리더: {faction.leader?.name || '없음'}</span>
              <span>문화: {faction.culture.aggression}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && isEditing && (
        <div className="editor-form">
          <h4>파벌 수정</h4>
          <FactionForm 
            faction={selectedItem}
            onSave={(updatedFaction) => {
              onFactionUpdate?.(updatedFaction);
              setIsEditing(false);
              setSelectedItem(null);
            }}
            onCancel={() => {
              setIsEditing(false);
              setSelectedItem(null);
            }}
          />
        </div>
      )}

      {isCreating && (
        <div className="editor-form">
          <h4>새 파벌 생성</h4>
          <FactionForm 
            faction={null}
            onSave={(newFaction) => {
              onFactionCreate?.(newFaction);
              setIsCreating(false);
            }}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="data-editor-panel">
      <div className="editor-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`editor-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-name">{tab.name}</span>
            <span className="tab-count">({tab.count})</span>
          </button>
        ))}
      </div>

      <div className="editor-content">
        {activeTab === 'entities' && renderEntityEditor()}
        {activeTab === 'animals' && renderAnimalEditor()}
        {activeTab === 'plants' && renderPlantEditor()}
        {activeTab === 'materials' && renderMaterialEditor()}
        {activeTab === 'factions' && renderFactionEditor()}
      </div>
    </div>
  );
};

// 폼 컴포넌트들
interface EntityFormProps {
  entity: Entity | null;
  onSave: (entity: Entity) => void;
  onCancel: () => void;
}

const EntityForm: React.FC<EntityFormProps> = ({ entity, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: entity?.name || '',
    species: entity?.species || 'human',
    hp: entity?.hp || 100,
    stamina: entity?.stamina || 100,
    hunger: entity?.hunger || 0,
    morale: entity?.morale || 50,
    age: entity?.age || 0,
    pos: entity?.pos || { x: 0, y: 0 },
    // 스탯
    str: entity?.stats?.str || 50,
    agi: entity?.stats?.agi || 50,
    end: entity?.stats?.end || 50,
    int: entity?.stats?.int || 50,
    per: entity?.stats?.per || 50,
    cha: entity?.stats?.cha || 50,
    // 스킬
    gather: entity?.skills?.gather || 30,
    analyze: entity?.skills?.analyze || 30,
    craft: entity?.skills?.craft || 30,
    build: entity?.skills?.build || 30,
    cook: entity?.skills?.cook || 30,
    combat: entity?.skills?.combat || 30,
    trade: entity?.skills?.trade || 30,
    lead: entity?.skills?.lead || 30,
    // 유전자
    survival: entity?.genes?.survival || 0.5,
    reproduction: entity?.genes?.reproduction || 0.5,
    curiosity: entity?.genes?.curiosity || 0.5,
    social: entity?.genes?.social || 0.5,
    prestige: entity?.genes?.prestige || 0.5,
    fatigue: entity?.genes?.fatigue || 0.5,
    // 후성유전
    epiSurvival: entity?.epi?.survival || 0,
    epiReproduction: entity?.epi?.reproduction || 0,
    epiCuriosity: entity?.epi?.curiosity || 0,
    epiSocial: entity?.epi?.social || 0,
    epiPrestige: entity?.epi?.prestige || 0,
    epiFatigue: entity?.epi?.fatigue || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntity: Entity = {
      ...entity,
      ...formData,
      id: entity?.id || `entity_${Date.now()}`,
      stats: {
        str: formData.str,
        agi: formData.agi,
        end: formData.end,
        int: formData.int,
        per: formData.per,
        cha: formData.cha
      },
      genes: {
        survival: formData.survival,
        reproduction: formData.reproduction,
        curiosity: formData.curiosity,
        social: formData.social,
        prestige: formData.prestige,
        fatigue: formData.fatigue
      },
      epi: {
        survival: formData.epiSurvival,
        reproduction: formData.epiReproduction,
        curiosity: formData.epiCuriosity,
        social: formData.epiSocial,
        prestige: formData.epiPrestige,
        fatigue: formData.epiFatigue
      },
      skills: {
        gather: formData.gather,
        analyze: formData.analyze,
        craft: formData.craft,
        build: formData.build,
        cook: formData.cook,
        combat: formData.combat,
        trade: formData.trade,
        lead: formData.lead
      },
      knowledge: entity?.knowledge || {},
      inventory: entity?.inventory || { items: {}, maxCapacity: 100 }
    };
    onSave(newEntity);
  };

  return (
    <form onSubmit={handleSubmit} className="editor-form-content">
      <div className="form-section">
        <h4>기본 정보</h4>
        <div className="form-group">
          <label>이름:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>종족:</label>
          <select
            value={formData.species}
            onChange={(e) => setFormData({ ...formData, species: e.target.value as any })}
          >
            <option value="human">인간</option>
            <option value="elf">엘프</option>
            <option value="dwarf">드워프</option>
          </select>
        </div>
        <div className="form-group">
          <label>HP:</label>
          <input
            type="number"
            value={formData.hp}
            onChange={(e) => setFormData({ ...formData, hp: parseInt(e.target.value) })}
          />
        </div>
        <div className="form-group">
          <label>스태미나:</label>
          <input
            type="number"
            value={formData.stamina}
            onChange={(e) => setFormData({ ...formData, stamina: parseInt(e.target.value) })}
          />
        </div>
        <div className="form-group">
          <label>배고픔:</label>
          <input
            type="number"
            value={formData.hunger}
            onChange={(e) => setFormData({ ...formData, hunger: parseInt(e.target.value) })}
          />
        </div>
        <div className="form-group">
          <label>사기:</label>
          <input
            type="number"
            value={formData.morale}
            onChange={(e) => setFormData({ ...formData, morale: parseInt(e.target.value) })}
          />
        </div>
        <div className="form-group">
          <label>나이:</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
          />
        </div>
        <div className="form-group">
          <label>위치 X:</label>
          <input
            type="number"
            value={formData.pos.x}
            onChange={(e) => setFormData({ ...formData, pos: { ...formData.pos, x: parseInt(e.target.value) } })}
          />
        </div>
        <div className="form-group">
          <label>위치 Y:</label>
          <input
            type="number"
            value={formData.pos.y}
            onChange={(e) => setFormData({ ...formData, pos: { ...formData.pos, y: parseInt(e.target.value) } })}
          />
        </div>
      </div>

      <div className="form-section">
        <h4>스탯</h4>
        <div className="stats-grid">
          <div className="form-group">
            <label>힘:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.str}
              onChange={(e) => setFormData({ ...formData, str: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>민첩:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.agi}
              onChange={(e) => setFormData({ ...formData, agi: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>체력:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.end}
              onChange={(e) => setFormData({ ...formData, end: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>지능:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.int}
              onChange={(e) => setFormData({ ...formData, int: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>지각:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.per}
              onChange={(e) => setFormData({ ...formData, per: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>매력:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.cha}
              onChange={(e) => setFormData({ ...formData, cha: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>스킬</h4>
        <div className="skills-grid">
          <div className="form-group">
            <label>수집:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.gather}
              onChange={(e) => setFormData({ ...formData, gather: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>분석:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.analyze}
              onChange={(e) => setFormData({ ...formData, analyze: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>제작:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.craft}
              onChange={(e) => setFormData({ ...formData, craft: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>건축:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.build}
              onChange={(e) => setFormData({ ...formData, build: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>요리:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.cook}
              onChange={(e) => setFormData({ ...formData, cook: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>전투:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.combat}
              onChange={(e) => setFormData({ ...formData, combat: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>거래:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.trade}
              onChange={(e) => setFormData({ ...formData, trade: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>지도:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.lead}
              onChange={(e) => setFormData({ ...formData, lead: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>유전자</h4>
        <div className="genes-grid">
          <div className="form-group">
            <label>생존:</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={formData.survival}
              onChange={(e) => setFormData({ ...formData, survival: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>번식:</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={formData.reproduction}
              onChange={(e) => setFormData({ ...formData, reproduction: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>호기심:</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={formData.curiosity}
              onChange={(e) => setFormData({ ...formData, curiosity: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>사회성:</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={formData.social}
              onChange={(e) => setFormData({ ...formData, social: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>명예:</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={formData.prestige}
              onChange={(e) => setFormData({ ...formData, prestige: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>피로:</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={formData.fatigue}
              onChange={(e) => setFormData({ ...formData, fatigue: parseFloat(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>후성유전</h4>
        <div className="epigenetics-grid">
          <div className="form-group">
            <label>생존:</label>
            <input
              type="number"
              min="-0.5"
              max="0.5"
              step="0.1"
              value={formData.epiSurvival}
              onChange={(e) => setFormData({ ...formData, epiSurvival: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>번식:</label>
            <input
              type="number"
              min="-0.5"
              max="0.5"
              step="0.1"
              value={formData.epiReproduction}
              onChange={(e) => setFormData({ ...formData, epiReproduction: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>호기심:</label>
            <input
              type="number"
              min="-0.5"
              max="0.5"
              step="0.1"
              value={formData.epiCuriosity}
              onChange={(e) => setFormData({ ...formData, epiCuriosity: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>사회성:</label>
            <input
              type="number"
              min="-0.5"
              max="0.5"
              step="0.1"
              value={formData.epiSocial}
              onChange={(e) => setFormData({ ...formData, epiSocial: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>명예:</label>
            <input
              type="number"
              min="-0.5"
              max="0.5"
              step="0.1"
              value={formData.epiPrestige}
              onChange={(e) => setFormData({ ...formData, epiPrestige: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>피로:</label>
            <input
              type="number"
              min="-0.5"
              max="0.5"
              step="0.1"
              value={formData.epiFatigue}
              onChange={(e) => setFormData({ ...formData, epiFatigue: parseFloat(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="save-btn">저장</button>
        <button type="button" onClick={onCancel} className="cancel-btn">취소</button>
      </div>
    </form>
  );
};

const AnimalForm: React.FC<{ animal: Animal | null; onSave: (animal: Animal) => void; onCancel: () => void }> = ({ animal, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: animal?.name || '',
    species: animal?.species || 'wolf',
    hp: animal?.hp || 100,
    stamina: animal?.stamina || 100,
    hunger: animal?.hunger || 0,
    morale: animal?.morale || 50,
    age: animal?.age || 0,
    pos: animal?.pos || { x: 0, y: 0 },
    // 동물 특성
    size: animal?.size || 0.5,
    speed: animal?.speed || 1,
    senses: animal?.senses || 1,
    threat: animal?.threat || 1,
    fear: animal?.fear || 0,
    pulseRadius: animal?.pulseRadius || 50,
    // 스탯
    str: animal?.stats?.str || 50,
    agi: animal?.stats?.agi || 50,
    end: animal?.stats?.end || 50,
    int: animal?.stats?.int || 50,
    per: animal?.stats?.per || 50,
    cha: animal?.stats?.cha || 50,
    // 스킬
    gather: animal?.skills?.gather || 30,
    analyze: animal?.skills?.analyze || 30,
    craft: animal?.skills?.craft || 30,
    build: animal?.skills?.build || 30,
    cook: animal?.skills?.cook || 30,
    combat: animal?.skills?.combat || 30,
    trade: animal?.skills?.trade || 30,
    lead: animal?.skills?.lead || 30,
    // 유전자
    survival: animal?.genes?.survival || 0.5,
    reproduction: animal?.genes?.reproduction || 0.5,
    curiosity: animal?.genes?.curiosity || 0.5,
    social: animal?.genes?.social || 0.5,
    prestige: animal?.genes?.prestige || 0.5,
    fatigue: animal?.genes?.fatigue || 0.5,
    // 후성유전
    epiSurvival: animal?.epi?.survival || 0,
    epiReproduction: animal?.epi?.reproduction || 0,
    epiCuriosity: animal?.epi?.curiosity || 0,
    epiSocial: animal?.epi?.social || 0,
    epiPrestige: animal?.epi?.prestige || 0,
    epiFatigue: animal?.epi?.fatigue || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAnimal: Animal = {
      ...animal,
      ...formData,
      id: animal?.id || `animal_${Date.now()}`,
      stats: {
        str: formData.str,
        agi: formData.agi,
        end: formData.end,
        int: formData.int,
        per: formData.per,
        cha: formData.cha
      },
      genes: {
        survival: formData.survival,
        reproduction: formData.reproduction,
        curiosity: formData.curiosity,
        social: formData.social,
        prestige: formData.prestige,
        fatigue: formData.fatigue
      },
      epi: {
        survival: formData.epiSurvival,
        reproduction: formData.epiReproduction,
        curiosity: formData.epiCuriosity,
        social: formData.epiSocial,
        prestige: formData.epiPrestige,
        fatigue: formData.epiFatigue
      },
      skills: {
        gather: formData.gather,
        analyze: formData.analyze,
        craft: formData.craft,
        build: formData.build,
        cook: formData.cook,
        combat: formData.combat,
        trade: formData.trade,
        lead: formData.lead
      },
      knowledge: animal?.knowledge || {},
      inventory: animal?.inventory || { items: {}, maxCapacity: 100 }
    };
    onSave(newAnimal);
  };

  return (
    <form onSubmit={handleSubmit} className="editor-form-content">
      <div className="form-section">
        <h4>기본 정보</h4>
        <div className="form-group">
          <label>이름:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>종:</label>
          <select
            value={formData.species}
            onChange={(e) => setFormData({ ...formData, species: e.target.value as any })}
          >
            <option value="wolf">늑대</option>
            <option value="bear">곰</option>
            <option value="deer">사슴</option>
            <option value="rabbit">토끼</option>
          </select>
        </div>
        <div className="form-group">
          <label>HP:</label>
          <input
            type="number"
            value={formData.hp}
            onChange={(e) => setFormData({ ...formData, hp: parseInt(e.target.value) })}
          />
        </div>
        <div className="form-group">
          <label>스태미나:</label>
          <input
            type="number"
            value={formData.stamina}
            onChange={(e) => setFormData({ ...formData, stamina: parseInt(e.target.value) })}
          />
        </div>
        <div className="form-group">
          <label>배고픔:</label>
          <input
            type="number"
            value={formData.hunger}
            onChange={(e) => setFormData({ ...formData, hunger: parseInt(e.target.value) })}
          />
        </div>
        <div className="form-group">
          <label>사기:</label>
          <input
            type="number"
            value={formData.morale}
            onChange={(e) => setFormData({ ...formData, morale: parseInt(e.target.value) })}
          />
        </div>
        <div className="form-group">
          <label>나이:</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
          />
        </div>
        <div className="form-group">
          <label>위치 X:</label>
          <input
            type="number"
            value={formData.pos.x}
            onChange={(e) => setFormData({ ...formData, pos: { ...formData.pos, x: parseInt(e.target.value) } })}
          />
        </div>
        <div className="form-group">
          <label>위치 Y:</label>
          <input
            type="number"
            value={formData.pos.y}
            onChange={(e) => setFormData({ ...formData, pos: { ...formData.pos, y: parseInt(e.target.value) } })}
          />
        </div>
      </div>

      <div className="form-section">
        <h4>동물 특성</h4>
        <div className="animal-traits-grid">
          <div className="form-group">
            <label>크기:</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>속도:</label>
            <input
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={formData.speed}
              onChange={(e) => setFormData({ ...formData, speed: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>감지:</label>
            <input
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={formData.senses}
              onChange={(e) => setFormData({ ...formData, senses: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>위협도:</label>
            <input
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={formData.threat}
              onChange={(e) => setFormData({ ...formData, threat: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>공포:</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={formData.fear}
              onChange={(e) => setFormData({ ...formData, fear: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>Pulse 반경:</label>
            <input
              type="number"
              min="0"
              max="200"
              value={formData.pulseRadius}
              onChange={(e) => setFormData({ ...formData, pulseRadius: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>스탯</h4>
        <div className="stats-grid">
          <div className="form-group">
            <label>힘:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.str}
              onChange={(e) => setFormData({ ...formData, str: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>민첩:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.agi}
              onChange={(e) => setFormData({ ...formData, agi: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>체력:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.end}
              onChange={(e) => setFormData({ ...formData, end: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>지능:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.int}
              onChange={(e) => setFormData({ ...formData, int: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>지각:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.per}
              onChange={(e) => setFormData({ ...formData, per: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>매력:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.cha}
              onChange={(e) => setFormData({ ...formData, cha: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>스킬</h4>
        <div className="skills-grid">
          <div className="form-group">
            <label>수집:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.gather}
              onChange={(e) => setFormData({ ...formData, gather: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>분석:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.analyze}
              onChange={(e) => setFormData({ ...formData, analyze: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>제작:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.craft}
              onChange={(e) => setFormData({ ...formData, craft: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>건축:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.build}
              onChange={(e) => setFormData({ ...formData, build: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>요리:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.cook}
              onChange={(e) => setFormData({ ...formData, cook: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>전투:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.combat}
              onChange={(e) => setFormData({ ...formData, combat: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>거래:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.trade}
              onChange={(e) => setFormData({ ...formData, trade: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>지도:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.lead}
              onChange={(e) => setFormData({ ...formData, lead: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>유전자</h4>
        <div className="genes-grid">
          <div className="form-group">
            <label>생존:</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={formData.survival}
              onChange={(e) => setFormData({ ...formData, survival: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>번식:</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={formData.reproduction}
              onChange={(e) => setFormData({ ...formData, reproduction: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>호기심:</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={formData.curiosity}
              onChange={(e) => setFormData({ ...formData, curiosity: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>사회성:</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={formData.social}
              onChange={(e) => setFormData({ ...formData, social: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>명예:</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={formData.prestige}
              onChange={(e) => setFormData({ ...formData, prestige: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>피로:</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={formData.fatigue}
              onChange={(e) => setFormData({ ...formData, fatigue: parseFloat(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>후성유전</h4>
        <div className="epigenetics-grid">
          <div className="form-group">
            <label>생존:</label>
            <input
              type="number"
              min="-0.5"
              max="0.5"
              step="0.1"
              value={formData.epiSurvival}
              onChange={(e) => setFormData({ ...formData, epiSurvival: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>번식:</label>
            <input
              type="number"
              min="-0.5"
              max="0.5"
              step="0.1"
              value={formData.epiReproduction}
              onChange={(e) => setFormData({ ...formData, epiReproduction: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>호기심:</label>
            <input
              type="number"
              min="-0.5"
              max="0.5"
              step="0.1"
              value={formData.epiCuriosity}
              onChange={(e) => setFormData({ ...formData, epiCuriosity: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>사회성:</label>
            <input
              type="number"
              min="-0.5"
              max="0.5"
              step="0.1"
              value={formData.epiSocial}
              onChange={(e) => setFormData({ ...formData, epiSocial: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>명예:</label>
            <input
              type="number"
              min="-0.5"
              max="0.5"
              step="0.1"
              value={formData.epiPrestige}
              onChange={(e) => setFormData({ ...formData, epiPrestige: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>피로:</label>
            <input
              type="number"
              min="-0.5"
              max="0.5"
              step="0.1"
              value={formData.epiFatigue}
              onChange={(e) => setFormData({ ...formData, epiFatigue: parseFloat(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="save-btn">저장</button>
        <button type="button" onClick={onCancel} className="cancel-btn">취소</button>
      </div>
    </form>
  );
};

const PlantForm: React.FC<{ plant: Plant | null; onSave: (plant: Plant) => void; onCancel: () => void }> = ({ plant, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: plant?.name || '',
    species: plant?.species || 'tree',
    growth: plant?.growth || 0,
    yield: plant?.yield || 0.5,
    pos: plant?.pos || { x: 0, y: 0 },
    // 식물 특성
    age: plant?.age || 0,
    resilience: plant?.resilience || 0.5,
    seedDispersion: plant?.seedDispersion || 0.5,
    hp: plant?.hp || 100,
    maxHp: plant?.maxHp || 100,
    size: plant?.size || 0.5,
    isMature: plant?.isMature || false,
    isDead: plant?.isDead || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlant: Plant = {
      ...plant,
      ...formData,
      id: plant?.id || `plant_${Date.now()}`
    };
    onSave(newPlant);
  };

  return (
    <form onSubmit={handleSubmit} className="editor-form-content">
      <div className="form-section">
        <h4>기본 정보</h4>
        <div className="form-group">
          <label>이름:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>종:</label>
          <select
            value={formData.species}
            onChange={(e) => setFormData({ ...formData, species: e.target.value as any })}
          >
            <option value="tree">나무</option>
            <option value="grass">풀</option>
            <option value="flower">꽃</option>
            <option value="bush">덤불</option>
            <option value="mushroom">버섯</option>
          </select>
        </div>
        <div className="form-group">
          <label>성장도:</label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.1"
            value={formData.growth}
            onChange={(e) => setFormData({ ...formData, growth: parseFloat(e.target.value) })}
          />
        </div>
        <div className="form-group">
          <label>수확량:</label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.1"
            value={formData.yield}
            onChange={(e) => setFormData({ ...formData, yield: parseFloat(e.target.value) })}
          />
        </div>
        <div className="form-group">
          <label>나이:</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
          />
        </div>
        <div className="form-group">
          <label>위치 X:</label>
          <input
            type="number"
            value={formData.pos.x}
            onChange={(e) => setFormData({ ...formData, pos: { ...formData.pos, x: parseInt(e.target.value) } })}
          />
        </div>
        <div className="form-group">
          <label>위치 Y:</label>
          <input
            type="number"
            value={formData.pos.y}
            onChange={(e) => setFormData({ ...formData, pos: { ...formData.pos, y: parseInt(e.target.value) } })}
          />
        </div>
      </div>

      <div className="form-section">
        <h4>식물 특성</h4>
        <div className="plant-traits-grid">
          <div className="form-group">
            <label>저항력:</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={formData.resilience}
              onChange={(e) => setFormData({ ...formData, resilience: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>씨앗 분산:</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={formData.seedDispersion}
              onChange={(e) => setFormData({ ...formData, seedDispersion: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>HP:</label>
            <input
              type="number"
              min="0"
              max="1000"
              value={formData.hp}
              onChange={(e) => setFormData({ ...formData, hp: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>최대 HP:</label>
            <input
              type="number"
              min="0"
              max="1000"
              value={formData.maxHp}
              onChange={(e) => setFormData({ ...formData, maxHp: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>크기:</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>성숙:</label>
            <input
              type="checkbox"
              checked={formData.isMature}
              onChange={(e) => setFormData({ ...formData, isMature: e.target.checked })}
            />
          </div>
          <div className="form-group">
            <label>사망:</label>
            <input
              type="checkbox"
              checked={formData.isDead}
              onChange={(e) => setFormData({ ...formData, isDead: e.target.checked })}
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="save-btn">저장</button>
        <button type="button" onClick={onCancel} className="cancel-btn">취소</button>
      </div>
    </form>
  );
};

const MaterialForm: React.FC<{ material: Material | null; onSave: (material: Material) => void; onCancel: () => void }> = ({ material, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: material?.name || '',
    tier: material?.tier || 1,
    props: material?.props || {},
    // 재료 특성
    hardness: material?.props?.hardness || 0,
    flexibility: material?.props?.flexibility || 0,
    durability: material?.props?.durability || 0,
    conductivity: material?.props?.conductivity || 0,
    flammability: material?.props?.flammability || 0,
    toxicity: material?.props?.toxicity || 0,
    rarity: material?.props?.rarity || 0,
    value: material?.props?.value || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMaterial: Material = {
      ...material,
      ...formData,
      id: material?.id || `material_${Date.now()}`,
      parents: material?.parents || undefined,
      props: {
        hardness: formData.hardness,
        flexibility: formData.flexibility,
        durability: formData.durability,
        conductivity: formData.conductivity,
        flammability: formData.flammability,
        toxicity: formData.toxicity,
        rarity: formData.rarity,
        value: formData.value
      }
    };
    onSave(newMaterial);
  };

  return (
    <form onSubmit={handleSubmit} className="editor-form-content">
      <div className="form-section">
        <h4>기본 정보</h4>
        <div className="form-group">
          <label>이름:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>티어:</label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.tier}
            onChange={(e) => setFormData({ ...formData, tier: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div className="form-section">
        <h4>재료 특성</h4>
        <div className="material-props-grid">
          <div className="form-group">
            <label>경도:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.hardness}
              onChange={(e) => setFormData({ ...formData, hardness: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>유연성:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.flexibility}
              onChange={(e) => setFormData({ ...formData, flexibility: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>내구성:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.durability}
              onChange={(e) => setFormData({ ...formData, durability: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>전도성:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.conductivity}
              onChange={(e) => setFormData({ ...formData, conductivity: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>가연성:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.flammability}
              onChange={(e) => setFormData({ ...formData, flammability: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>독성:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.toxicity}
              onChange={(e) => setFormData({ ...formData, toxicity: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>희귀도:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.rarity}
              onChange={(e) => setFormData({ ...formData, rarity: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>가치:</label>
            <input
              type="number"
              min="0"
              max="1000"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="save-btn">저장</button>
        <button type="button" onClick={onCancel} className="cancel-btn">취소</button>
      </div>
    </form>
  );
};

const FactionForm: React.FC<{ faction: Faction | null; onSave: (faction: Faction) => void; onCancel: () => void }> = ({ faction, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: faction?.name || '',
    color: faction?.color || '#4ecdc4',
    // 문화
    aggression: faction?.culture?.aggression || 0.5,
    cooperation: faction?.culture?.cooperation || 0.5,
    innovation: faction?.culture?.innovation || 0.5,
    tradition: faction?.culture?.tradition || 0.5,
    // 통계
    population: faction?.stats?.population || 0,
    military: faction?.stats?.military || 0,
    economy: faction?.stats?.economy || 0,
    technology: faction?.stats?.technology || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFaction: Faction = {
      ...faction,
      ...formData,
      id: faction?.id || `faction_${Date.now()}`,
      members: faction?.members || [],
      leader: faction?.leader || null,
      culture: {
        aggression: formData.aggression,
        cooperation: formData.cooperation,
        innovation: formData.innovation,
        tradition: formData.tradition
      },
      resources: faction?.resources || {},
      relations: faction?.relations || {},
      territory: faction?.territory || [],
      stats: {
        population: formData.population,
        military: formData.military,
        economy: formData.economy,
        technology: formData.technology
      }
    };
    onSave(newFaction);
  };

  return (
    <form onSubmit={handleSubmit} className="editor-form-content">
      <div className="form-section">
        <h4>기본 정보</h4>
        <div className="form-group">
          <label>이름:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>색상:</label>
          <input
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          />
        </div>
      </div>

      <div className="form-section">
        <h4>문화</h4>
        <div className="culture-grid">
          <div className="form-group">
            <label>공격성:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.aggression * 100}
              onChange={(e) => setFormData({ ...formData, aggression: parseInt(e.target.value) / 100 })}
            />
          </div>
          <div className="form-group">
            <label>협력성:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.cooperation * 100}
              onChange={(e) => setFormData({ ...formData, cooperation: parseInt(e.target.value) / 100 })}
            />
          </div>
          <div className="form-group">
            <label>혁신성:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.innovation * 100}
              onChange={(e) => setFormData({ ...formData, innovation: parseInt(e.target.value) / 100 })}
            />
          </div>
          <div className="form-group">
            <label>전통성:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.tradition * 100}
              onChange={(e) => setFormData({ ...formData, tradition: parseInt(e.target.value) / 100 })}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>통계</h4>
        <div className="faction-stats-grid">
          <div className="form-group">
            <label>인구:</label>
            <input
              type="number"
              min="0"
              max="1000"
              value={formData.population}
              onChange={(e) => setFormData({ ...formData, population: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>군사력:</label>
            <input
              type="number"
              min="0"
              max="1000"
              value={formData.military}
              onChange={(e) => setFormData({ ...formData, military: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>경제력:</label>
            <input
              type="number"
              min="0"
              max="1000"
              value={formData.economy}
              onChange={(e) => setFormData({ ...formData, economy: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>기술력:</label>
            <input
              type="number"
              min="0"
              max="1000"
              value={formData.technology}
              onChange={(e) => setFormData({ ...formData, technology: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="save-btn">저장</button>
        <button type="button" onClick={onCancel} className="cancel-btn">취소</button>
      </div>
    </form>
  );
}; 