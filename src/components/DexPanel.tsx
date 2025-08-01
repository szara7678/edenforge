import { Material } from '../types';

interface DexPanelProps {
  materials: Material[];
  onMaterialSelect?: (material: Material) => void;
}

const DexPanel: React.FC<DexPanelProps> = ({ materials, onMaterialSelect }) => {
  const getTierColor = (tier: number): string => {
    switch (tier) {
      case 1: return '#6bcf7f'; // 초록
      case 2: return '#4ecdc4'; // 청록
      case 3: return '#45b7d1'; // 파랑
      case 4: return '#ffd93d'; // 노랑
      case 5: return '#ff8c00'; // 주황
      default: return '#ff6b6b'; // 빨강
    }
  };

  const formatProps = (props: Record<string, number>): string => {
    return Object.entries(props)
      .map(([key, value]) => `${key}: ${(value * 100).toFixed(0)}%`)
      .join(', ');
  };

  return (
    <div style={{
      position: 'absolute',
      top: 10,
      right: 10,
      width: '350px',
      height: '400px',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '5px',
      fontFamily: 'Noto Sans KR, sans-serif',
      fontSize: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        borderBottom: '1px solid #333',
        paddingBottom: '10px'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>🔬 재료 도감</h3>
        <span style={{ fontSize: '12px', opacity: 0.7 }}>
          {materials.length}개 발견
        </span>
      </div>
      
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {materials
          .sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name))
          .map((material) => (
            <div 
              key={material.id}
              onClick={() => onMaterialSelect?.(material)}
              style={{
                padding: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '5px',
                border: `2px solid ${getTierColor(material.tier)}`,
                cursor: onMaterialSelect ? 'pointer' : 'default',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '5px'
              }}>
                <span style={{ 
                  fontWeight: 'bold', 
                  fontSize: '14px',
                  color: getTierColor(material.tier)
                }}>
                  {material.name}
                </span>
                <span style={{ 
                  fontSize: '10px', 
                  opacity: 0.7,
                  backgroundColor: getTierColor(material.tier),
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '10px'
                }}>
                  티어 {material.tier}
                </span>
              </div>
              
              <div style={{ 
                fontSize: '10px', 
                opacity: 0.8,
                marginBottom: '5px'
              }}>
                {formatProps(material.props)}
              </div>
              
              {material.parents && (
                <div style={{ 
                  fontSize: '9px', 
                  opacity: 0.6,
                  fontStyle: 'italic'
                }}>
                  부모: {material.parents.join(' + ')}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default DexPanel; 