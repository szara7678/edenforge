import React, { useState, useEffect } from 'react';
import { parameterManager, ParameterSet } from '../parameters';

interface ParameterPanelProps {
  onClose: () => void;
}

interface ParameterSliderProps {
  name: string;
  parameter: any;
  onValueChange: (name: string, value: number) => void;
}

const ParameterSlider: React.FC<ParameterSliderProps> = ({ name, parameter, onValueChange }) => {
  return (
    <div style={{
      marginBottom: '15px',
      padding: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '5px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '5px'
      }}>
        <label style={{
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#fff'
        }}>
          {parameter.description}
        </label>
        <span style={{
          fontSize: '11px',
          color: '#aaa',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          padding: '2px 6px',
          borderRadius: '3px'
        }}>
          {parameter.category}
        </span>
      </div>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <input
          type="range"
          min={parameter.min}
          max={parameter.max}
          step={parameter.step}
          value={parameter.value}
          onChange={(e) => onValueChange(name, parseFloat(e.target.value))}
          style={{
            flex: 1,
            height: '6px',
            borderRadius: '3px',
            background: 'rgba(255, 255, 255, 0.2)',
            outline: 'none',
            cursor: 'pointer'
          }}
        />
        <input
          type="number"
          value={parameter.value}
          onChange={(e) => onValueChange(name, parseFloat(e.target.value))}
          style={{
            width: '60px',
            padding: '2px 4px',
            fontSize: '11px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '3px',
            color: '#fff',
            textAlign: 'center'
          }}
        />
      </div>
      
      <div style={{
        fontSize: '10px',
        color: '#888',
        marginTop: '3px'
      }}>
        범위: {parameter.min} ~ {parameter.max} (단계: {parameter.step})
      </div>
    </div>
  );
};

const ParameterPanel: React.FC<ParameterPanelProps> = ({ onClose }) => {
  const [parameters, setParameters] = useState<ParameterSet | null>(null);
  const [activeCategory, setActiveCategory] = useState<keyof ParameterSet>('entity');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // 파라미터 로드
    parameterManager.loadParameters();
    setParameters(parameterManager.getAllParameters());
  }, []);

  const handleParameterChange = (category: keyof ParameterSet, name: string, value: number) => {
    parameterManager.setParameter(category, name, value);
    setParameters(parameterManager.getAllParameters());
  };

  const handleSave = () => {
    parameterManager.saveParameters();
    alert('파라미터가 저장되었습니다!');
  };

  const handleReset = () => {
    if (confirm('모든 파라미터를 기본값으로 리셋하시겠습니까?')) {
      parameterManager.resetToDefaults();
      setParameters(parameterManager.getAllParameters());
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(parameterManager.getAllParameters(), null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'edenforge_parameters.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedParams = JSON.parse(e.target?.result as string);
          // 파라미터 매니저에 임포트
          Object.entries(importedParams).forEach(([category, catData]: [string, any]) => {
            Object.entries(catData.parameters).forEach(([name, param]: [string, any]) => {
              parameterManager.setParameter(category as keyof ParameterSet, name, param.value);
            });
          });
          setParameters(parameterManager.getAllParameters());
          alert('파라미터가 임포트되었습니다!');
        } catch (error) {
          alert('파일 형식이 올바르지 않습니다.');
        }
      };
      reader.readAsText(file);
    }
  };

  if (!parameters) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        color: '#fff',
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        파라미터를 로딩 중...
      </div>
    );
  }

  const categories = [
    { key: 'entity', name: '엔티티', icon: '👤' },
    { key: 'animal', name: '동물', icon: '🐺' },
    { key: 'plant', name: '식물', icon: '🌿' },
    { key: 'material', name: '재료', icon: '🔧' },
    { key: 'faction', name: '파벌', icon: '⚔️' },
    { key: 'ecosystem', name: '생태계', icon: '🌍' },
    { key: 'world', name: '월드', icon: '🌎' },
    { key: 'genetics', name: '유전', icon: '🧬' },
    { key: 'learning', name: '학습', icon: '🧠' }
  ];

  const filteredParameters = Object.entries(parameters[activeCategory].parameters)
    .filter(([name, param]) => 
      param.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '15px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>파라미터 편집</h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          ×
        </button>
      </div>

      {/* 컨트롤 버튼들 */}
      <div style={{
        padding: '10px 15px',
        display: 'flex',
        gap: '10px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <button
          onClick={handleSave}
          style={{
            padding: '5px 10px',
            backgroundColor: '#4CAF50',
            border: 'none',
            borderRadius: '3px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          저장
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: '5px 10px',
            backgroundColor: '#f44336',
            border: 'none',
            borderRadius: '3px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          리셋
        </button>
        <button
          onClick={handleExport}
          style={{
            padding: '5px 10px',
            backgroundColor: '#2196F3',
            border: 'none',
            borderRadius: '3px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          내보내기
        </button>
        <label style={{
          padding: '5px 10px',
          backgroundColor: '#FF9800',
          borderRadius: '3px',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '12px',
          margin: 0
        }}>
          가져오기
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {/* 카테고리 탭 */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        overflowX: 'auto'
      }}>
        {categories.map(({ key, name, icon }) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key as keyof ParameterSet)}
            style={{
              padding: '10px 15px',
              backgroundColor: activeCategory === key ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span>{icon}</span>
            {name}
          </button>
        ))}
      </div>

      {/* 검색 */}
      <div style={{
        padding: '10px 15px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <input
          type="text"
          placeholder="파라미터 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '3px',
            color: '#fff',
            fontSize: '12px'
          }}
        />
      </div>

      {/* 파라미터 목록 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '15px'
      }}>
        <div style={{
          marginBottom: '10px',
          fontSize: '14px',
          color: '#aaa'
        }}>
          {parameters[activeCategory].name} - {parameters[activeCategory].description}
        </div>
        
        {filteredParameters.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            color: '#888',
            fontStyle: 'italic'
          }}>
            검색 결과가 없습니다.
          </div>
        ) : (
          filteredParameters.map(([name, parameter]) => (
            <ParameterSlider
              key={name}
              name={name}
              parameter={parameter}
              onValueChange={(name, value) => handleParameterChange(activeCategory, name, value)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ParameterPanel; 