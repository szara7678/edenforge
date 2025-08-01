import React from 'react';
import { Entity, Material, Faction, Animal, Plant } from '../types';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Entity | Material | Faction | Animal | Plant | null;
  type: 'entity' | 'material' | 'faction' | 'animal' | 'plant' | null;
}

export const DetailModal: React.FC<DetailModalProps> = ({ 
  isOpen, 
  onClose, 
  data, 
  type 
}) => {
  if (!isOpen || !data || !type) return null;

  const renderEntityDetails = (entity: Entity) => (
    <div className="modal-content">
      <h2>{entity.name}</h2>
      <div className="detail-section">
        <h3>기본 정보</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="label">종족:</span>
            <span className="value">{entity.species}</span>
          </div>
          <div className="detail-item">
            <span className="label">나이:</span>
            <span className="value">{entity.age.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="label">HP:</span>
            <span className="value">{entity.hp.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="label">스태미나:</span>
            <span className="value">{entity.stamina.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="label">배고픔:</span>
            <span className="value">{entity.hunger.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="label">사기:</span>
            <span className="value">{entity.morale.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h3>스탯</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="label">힘:</span>
            <span className="value">{entity.stats.str.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="label">민첩:</span>
            <span className="value">{entity.stats.agi.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="label">체력:</span>
            <span className="value">{entity.stats.end.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="label">지능:</span>
            <span className="value">{entity.stats.int.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="label">지각:</span>
            <span className="value">{entity.stats.per.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="label">매력:</span>
            <span className="value">{entity.stats.cha.toFixed(2)}</span>
          </div>
        </div>
        </div>

      <div className="detail-section">
        <h3>스킬</h3>
        <div className="detail-grid">
          {Object.entries(entity.skills).map(([skill, level]) => (
            <div key={skill} className="detail-item">
              <span className="label">{skill}:</span>
              <span className="value">{level.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

      <div className="detail-section">
        <h3>유전자</h3>
        <div className="detail-grid">
          {Object.entries(entity.genes).map(([gene, value]) => (
            <div key={gene} className="detail-item">
              <span className="label">{gene}:</span>
              <span className="value">{value.toFixed(2)}</span>
            </div>
          ))}
              </div>
              </div>

      <div className="detail-section">
        <h3>후성유전</h3>
        <div className="detail-grid">
          {Object.entries(entity.epi).map(([epi, value]) => (
            <div key={epi} className="detail-item">
              <span className="label">{epi}:</span>
              <span className="value">{value.toFixed(2)}</span>
            </div>
          ))}
            </div>
          </div>

      {entity.inventory && (
        <div className="detail-section">
          <h3>인벤토리</h3>
          <div className="detail-grid">
            {Object.entries(entity.inventory.items).map(([item, amount]) => (
              <div key={item} className="detail-item">
                <span className="label">{item}:</span>
                <span className="value">{amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    );

  const renderMaterialDetails = (material: Material) => (
    <div className="modal-content">
      <h2>{material.name}</h2>
      <div className="detail-section">
        <h3>기본 정보</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="label">티어:</span>
            <span className="value">{material.tier}</span>
          </div>
          <div className="detail-item">
            <span className="label">ID:</span>
            <span className="value">{material.id}</span>
          </div>
        </div>
            </div>

      <div className="detail-section">
        <h3>속성</h3>
        <div className="detail-grid">
          {Object.entries(material.props).map(([prop, value]) => (
            <div key={prop} className="detail-item">
              <span className="label">{prop}:</span>
              <span className="value">{value.toFixed(2)}</span>
            </div>
          ))}
            </div>
            </div>

      {material.parents && (
        <div className="detail-section">
          <h3>부모 재료</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="label">부모 1:</span>
              <span className="value">{material.parents[0]}</span>
            </div>
            <div className="detail-item">
              <span className="label">부모 2:</span>
              <span className="value">{material.parents[1]}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderFactionDetails = (faction: Faction) => (
    <div className="modal-content">
      <h2>{faction.name}</h2>
      <div className="detail-section">
        <h3>기본 정보</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="label">리더:</span>
            <span className="value">{faction.leader?.name || '없음'}</span>
          </div>
          <div className="detail-item">
            <span className="label">멤버 수:</span>
            <span className="value">{faction.members.length}</span>
          </div>
          <div className="detail-item">
            <span className="label">인구:</span>
            <span className="value">{faction.stats.population}</span>
          </div>
          <div className="detail-item">
            <span className="label">군사력:</span>
            <span className="value">{faction.stats.military}</span>
              </div>
          <div className="detail-item">
            <span className="label">경제력:</span>
            <span className="value">{faction.stats.economy}</span>
          </div>
          <div className="detail-item">
            <span className="label">기술력:</span>
            <span className="value">{faction.stats.technology}</span>
            </div>
          </div>
        </div>

      <div className="detail-section">
        <h3>문화</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="label">공격성:</span>
            <span className="value">{faction.culture.aggression.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="label">협력성:</span>
            <span className="value">{faction.culture.cooperation.toFixed(2)}</span>
              </div>
          <div className="detail-item">
            <span className="label">혁신성:</span>
            <span className="value">{faction.culture.innovation.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="label">전통성:</span>
            <span className="value">{faction.culture.tradition.toFixed(2)}</span>
            </div>
          </div>
        </div>

      <div className="detail-section">
        <h3>자원</h3>
        <div className="detail-grid">
          {Object.entries(faction.resources).map(([resource, amount]) => (
            <div key={resource} className="detail-item">
              <span className="label">{resource}:</span>
              <span className="value">{amount}</span>
                </div>
              ))}
            </div>
      </div>
    </div>
  );

  const renderAnimalDetails = (animal: Animal) => (
    <div className="modal-content">
      <h2>{animal.name}</h2>
      <div className="detail-section">
        <h3>기본 정보</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="label">종족:</span>
            <span className="value">{animal.species}</span>
          </div>
          <div className="detail-item">
            <span className="label">크기:</span>
            <span className="value">{animal.size.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="label">속도:</span>
            <span className="value">{animal.speed.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="label">감지:</span>
            <span className="value">{animal.senses.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="label">위협도:</span>
            <span className="value">{animal.threat.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="label">공포:</span>
            <span className="value">{animal.fear.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h3>상태</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="label">HP:</span>
            <span className="value">{Math.floor(animal.hp)}</span>
          </div>
          <div className="detail-item">
            <span className="label">스태미나:</span>
            <span className="value">{Math.floor(animal.stamina)}</span>
                </div>
          <div className="detail-item">
            <span className="label">배고픔:</span>
            <span className="value">{Math.floor(animal.hunger)}</span>
            </div>
          <div className="detail-item">
            <span className="label">나이:</span>
            <span className="value">{Math.floor(animal.age)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlantDetails = (plant: Plant) => (
    <div className="modal-content">
      <h2>{plant.species}</h2>
      <div className="detail-section">
        <h3>기본 정보</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="label">종류:</span>
            <span className="value">{plant.species}</span>
          </div>
          <div className="detail-item">
            <span className="label">성장도:</span>
            <span className="value">{plant.growth.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="label">저항력:</span>
            <span className="value">{plant.resilience.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="label">분산력:</span>
            <span className="value">{plant.seedDispersion.toFixed(2)}</span>
                </div>
          <div className="detail-item">
            <span className="label">크기:</span>
            <span className="value">{plant.size.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="label">수확량:</span>
            <span className="value">{plant.yield.toFixed(2)}</span>
            </div>
          </div>
        </div>

      <div className="detail-section">
        <h3>상태</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="label">HP:</span>
            <span className="value">{Math.floor(plant.hp)}</span>
          </div>
          <div className="detail-item">
            <span className="label">나이:</span>
            <span className="value">{Math.floor(plant.age)}</span>
            </div>
          <div className="detail-item">
            <span className="label">성숙:</span>
            <span className="value">{plant.isMature ? '예' : '아니오'}</span>
          </div>
          <div className="detail-item">
            <span className="label">사망:</span>
            <span className="value">{plant.isDead ? '예' : '아니오'}</span>
            </div>
          </div>
        </div>
      </div>
    );

  const renderContent = () => {
    switch (type) {
      case 'entity':
        return renderEntityDetails(data as Entity);
      case 'material':
        return renderMaterialDetails(data as Material);
      case 'faction':
        return renderFactionDetails(data as Faction);
      case 'animal':
        return renderAnimalDetails(data as Animal);
      case 'plant':
        return renderPlantDetails(data as Plant);
      default:
        return <div>알 수 없는 타입입니다.</div>;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>상세 정보</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};