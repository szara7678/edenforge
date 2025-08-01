import React, { useState } from 'react';
import { Animal, Plant, Pulse, Biome } from '../types';

interface EcosystemPanelProps {
  animals: Animal[];
  plants: Plant[];
  pulses: Pulse[];
  biomes: Biome[];
  onAnimalSelect?: (animal: Animal) => void;
  onPlantSelect?: (plant: Plant) => void;
}

export const EcosystemPanel: React.FC<EcosystemPanelProps> = ({ 
  animals, 
  plants, 
  pulses, 
  biomes,
  onAnimalSelect,
  onPlantSelect
}) => {
  const [selectedTab, setSelectedTab] = useState<'animals' | 'plants' | 'pulses' | 'biomes'>('animals');
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  const handleAnimalSelect = (animal: Animal) => {
    setSelectedAnimal(animal);
    onAnimalSelect?.(animal);
  };

  const handlePlantSelect = (plant: Plant) => {
    setSelectedPlant(plant);
    onPlantSelect?.(plant);
  };

  const getAnimalSpeciesName = (species: Animal['species']): string => {
    const names: Record<Animal['species'], string> = {
      wolf: '늑대',
      deer: '사슴',
      rabbit: '토끼',
      bear: '곰',
      fox: '여우'
    };
    return names[species];
  };

  const getPlantSpeciesName = (species: Plant['species']): string => {
    const names: Record<Plant['species'], string> = {
      tree: '나무',
      grass: '풀',
      bush: '덤불',
      flower: '꽃',
      mushroom: '버섯'
    };
    return names[species];
  };

  const getPulseTypeName = (type: Pulse['type']): string => {
    const names: Record<Pulse['type'], string> = {
      fear: '공포',
      attraction: '매력',
      danger: '위험',
      food: '먹이'
    };
    return names[type];
  };

  const getAnimalStatus = (animal: Animal): string => {
    if (animal.hp <= 0) return '사망';
    if (animal.hp < 30) return '부상';
    if (animal.fear > 0.5) return '공포';
    if (animal.hunger > 70) return '배고픔';
    return '정상';
  };

  const getPlantStatus = (plant: Plant): string => {
    if (plant.isDead) return '사망';
    if (plant.isMature) return '성숙';
    if (plant.growth > 0.5) return '성장';
    return '새싹';
  };

  return (
    <div className="ecosystem-panel">
      <div className="ecosystem-header">
        <h3>생태계</h3>
        <div className="ecosystem-stats">
          동물: {animals.length} | 식물: {plants.length} | Pulse: {pulses.length}
        </div>
      </div>

      <div className="ecosystem-content">
        <div className="ecosystem-tabs">
          <button 
            className={selectedTab === 'animals' ? 'active' : ''}
            onClick={() => setSelectedTab('animals')}
          >
            동물
          </button>
          <button 
            className={selectedTab === 'plants' ? 'active' : ''}
            onClick={() => setSelectedTab('plants')}
          >
            식물
          </button>
          <button 
            className={selectedTab === 'pulses' ? 'active' : ''}
            onClick={() => setSelectedTab('pulses')}
          >
            Pulse
          </button>
          <button 
            className={selectedTab === 'biomes' ? 'active' : ''}
            onClick={() => setSelectedTab('biomes')}
          >
            바이옴
          </button>
        </div>

        <div className="tab-content">
          {selectedTab === 'animals' && (
            <div className="animals-tab">
              <div className="animal-list">
                {animals.map(animal => (
                  <div 
                    key={animal.id}
                    className={`animal-item ${selectedAnimal?.id === animal.id ? 'selected' : ''}`}
                    onClick={() => handleAnimalSelect(animal)}
                  >
                    <div className="animal-info">
                      <div className="animal-name">{animal.name}</div>
                      <div className="animal-species">{getAnimalSpeciesName(animal.species)}</div>
                      <div className="animal-stats">
                        HP: {Math.floor(animal.hp)} | 
                        나이: {Math.floor(animal.age)} | 
                        상태: {getAnimalStatus(animal)}
                      </div>
                    </div>
                    <div className="animal-traits">
                      <div>크기: {animal.size.toFixed(2)}</div>
                      <div>속도: {animal.speed.toFixed(2)}</div>
                      <div>위협: {animal.threat.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedAnimal && (
                <div className="animal-details">
                  <h5>{selectedAnimal.name} 상세 정보</h5>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <div className="detail-label">종족</div>
                      <div className="detail-value">{getAnimalSpeciesName(selectedAnimal.species)}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">HP</div>
                      <div className="detail-value">{Math.floor(selectedAnimal.hp)}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">스태미나</div>
                      <div className="detail-value">{Math.floor(selectedAnimal.stamina)}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">배고픔</div>
                      <div className="detail-value">{Math.floor(selectedAnimal.hunger)}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">공포</div>
                      <div className="detail-value">{selectedAnimal.fear.toFixed(2)}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">위협도</div>
                      <div className="detail-value">{selectedAnimal.threat.toFixed(2)}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">크기</div>
                      <div className="detail-value">{selectedAnimal.size.toFixed(2)}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">속도</div>
                      <div className="detail-value">{selectedAnimal.speed.toFixed(2)}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">감지</div>
                      <div className="detail-value">{selectedAnimal.senses.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'plants' && (
            <div className="plants-tab">
              <div className="plant-list">
                {plants.map(plant => (
                  <div 
                    key={plant.id}
                    className={`plant-item ${selectedPlant?.id === plant.id ? 'selected' : ''}`}
                    onClick={() => handlePlantSelect(plant)}
                  >
                    <div className="plant-info">
                      <div className="plant-species">{getPlantSpeciesName(plant.species)}</div>
                      <div className="plant-stats">
                        HP: {Math.floor(plant.hp)} | 
                        나이: {Math.floor(plant.age)} | 
                        상태: {getPlantStatus(plant)}
                      </div>
                    </div>
                    <div className="plant-traits">
                      <div>성장: {plant.growth.toFixed(2)}</div>
                      <div>크기: {plant.size.toFixed(2)}</div>
                      <div>수확: {plant.yield.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedPlant && (
                <div className="plant-details">
                  <h5>{getPlantSpeciesName(selectedPlant.species)} 상세 정보</h5>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <div className="detail-label">종류</div>
                      <div className="detail-value">{getPlantSpeciesName(selectedPlant.species)}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">HP</div>
                      <div className="detail-value">{Math.floor(selectedPlant.hp)}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">나이</div>
                      <div className="detail-value">{Math.floor(selectedPlant.age)}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">성장도</div>
                      <div className="detail-value">{selectedPlant.growth.toFixed(2)}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">저항력</div>
                      <div className="detail-value">{selectedPlant.resilience.toFixed(2)}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">분산력</div>
                      <div className="detail-value">{selectedPlant.seedDispersion.toFixed(2)}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">크기</div>
                      <div className="detail-value">{selectedPlant.size.toFixed(2)}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">수확량</div>
                      <div className="detail-value">{selectedPlant.yield.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'pulses' && (
            <div className="pulses-tab">
              <h5>활성 Pulse ({pulses.length}개)</h5>
              <div className="pulse-list">
                {pulses.map(pulse => (
                  <div key={pulse.id} className="pulse-item">
                    <div className="pulse-info">
                      <div className="pulse-type">{getPulseTypeName(pulse.type)}</div>
                      <div className="pulse-source">{pulse.source.name}</div>
                      <div className="pulse-stats">
                        강도: {pulse.intensity.toFixed(2)} | 
                        반경: {Math.floor(pulse.radius)} | 
                        나이: {pulse.age}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'biomes' && (
            <div className="biomes-tab">
              <h5>바이옴 정보</h5>
              <div className="biome-list">
                {biomes.map(biome => (
                  <div key={biome.id} className="biome-item">
                    <div className="biome-name">{biome.name}</div>
                    <div className="biome-info">
                      <div>기후: {biome.climate}</div>
                      <div>자원 풍부도: {biome.resourceRichness.toFixed(2)}</div>
                      <div>성장률: {biome.growthRate.toFixed(2)}</div>
                    </div>
                    <div className="biome-species">
                      <div>동물: {biome.animalTypes.join(', ')}</div>
                      <div>식물: {biome.plantTypes.join(', ')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 