import { useState, useRef, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, RoundedBox, OrbitControls, Plane, TransformControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

const ELEMENT_TYPES = {
  plane: { label: 'Plane', defaultColor: '#3b82f6', defaultSize: [1, 1, 0.02] },
  box: { label: 'Box', defaultColor: '#22c55e', defaultSize: [1, 1, 1] },
  sphere: { label: 'Sphere', defaultColor: '#ef4444', defaultSize: [0.5, 32, 32] },
  text: { label: 'Text', defaultColor: '#ffffff', defaultSize: [0.5] },
  cylinder: { label: 'Cylinder', defaultColor: '#f7c948', defaultSize: [0.5, 0.5, 1, 32] },
};

function DraggableElement({ element, isSelected, onSelect, onPositionChange }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (ref.current && isSelected) {
      ref.current.position.set(...element.position);
      ref.current.rotation.set(...element.rotation);
      ref.current.scale.set(...element.scale);
    }
  });

  const handlePointerDown = (e) => {
    e.stopPropagation();
    onSelect(element.id);
  };

  const renderGeometry = () => {
    switch (element.type) {
      case 'plane':
        return (
          <RoundedBox args={element.size} radius={0.02} smoothness={2}>
            <meshStandardMaterial
              color={hovered ? '#ffffff' : element.color}
              metalness={element.material?.metalness || 0.2}
              roughness={element.material?.roughness || 0.8}
              transparent
              opacity={element.material?.opacity || 1}
              emissive={element.color}
              emissiveIntensity={isSelected ? 0.2 : 0}
            />
          </RoundedBox>
        );
      case 'box':
        return (
          <RoundedBox args={element.size} radius={0.05} smoothness={4}>
            <meshStandardMaterial
              color={hovered ? '#ffffff' : element.color}
              metalness={element.material?.metalness || 0.3}
              roughness={element.material?.roughness || 0.6}
              transparent
              opacity={element.material?.opacity || 1}
            />
          </RoundedBox>
        );
      case 'sphere':
        return (
          <mesh>
            <sphereGeometry args={element.size} />
            <meshStandardMaterial
              color={hovered ? '#ffffff' : element.color}
              metalness={element.material?.metalness || 0.4}
              roughness={element.material?.roughness || 0.4}
              transparent
              opacity={element.material?.opacity || 1}
            />
          </mesh>
        );
      case 'cylinder':
        return (
          <mesh>
            <cylinderGeometry args={element.size} />
            <meshStandardMaterial
              color={hovered ? '#ffffff' : element.color}
              metalness={element.material?.metalness || 0.3}
              roughness={element.material?.roughness || 0.5}
              transparent
              opacity={element.material?.opacity || 1}
            />
          </mesh>
        );
      case 'text':
        return (
          <Text
            fontSize={element.size[0] || 0.5}
            color={element.color}
            anchorX="center"
            anchorY="middle"
            fontWeight={element.material?.fontWeight || 'bold'}
          >
            {element.content || 'Text'}
          </Text>
        );
      default:
        return (
          <RoundedBox args={[1, 1, 0.02]} radius={0.02} smoothness={2}>
            <meshStandardMaterial color={element.color} />
          </RoundedBox>
        );
    }
  };

  return (
    <group
      ref={ref}
      position={element.position}
      rotation={element.rotation}
      scale={element.scale}
      onPointerDown={handlePointerDown}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {renderGeometry()}
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(1.1, 1.1, 1.1)]} />
          <lineBasicMaterial color="#f7c948" linewidth={2} />
        </lineSegments>
      )}
    </group>
  );
}

function SceneGrid() {
  return (
    <group position={[0, -0.01, 0]}>
      <gridHelper args={[20, 20, '#1a2235', '#111827']} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0a0e1a" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[-5, 5, 5]} intensity={0.4} color="#f7c948" />
      <spotLight position={[0, 10, 0]} intensity={0.3} angle={0.6} penumbra={0.5} />
    </>
  );
}

export default function SceneBuilder3D({
  elements = [],
  selectedId,
  onSelectElement,
  onAddElement,
  onUpdateElement,
  cameraPosition = [5, 4, 8],
  className = '',
}) {
  const [transformMode, setTransformMode] = useState('translate');

  const addElement = useCallback((type) => {
    const config = ELEMENT_TYPES[type];
    if (!config || !onAddElement) return;

    const newElement = {
      id: `el_${Date.now()}`,
      type,
      name: `${config.label} ${elements.length + 1}`,
      position: [0, 0.5 + elements.length * 0.3, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: config.defaultColor,
      size: [...config.defaultSize],
      content: type === 'text' ? 'Sample' : '',
      material: { metalness: 0.2, roughness: 0.8, opacity: 1 },
    };

    onAddElement(newElement);
  }, [elements.length, onAddElement]);

  return (
    <div className={`scene-builder-3d ${className}`} style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: cameraPosition, fov: 50 }}
        dpr={[1, 2]}
        shadows
        onPointerMissed={() => onSelectElement && onSelectElement(null)}
      >
        <SceneLighting />
        <SceneGrid />

        {elements.map((el) => (
          <DraggableElement
            key={el.id}
            element={el}
            isSelected={selectedId === el.id}
            onSelect={onSelectElement}
          />
        ))}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={20}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          enableDamping
          dampingFactor={0.05}
        />
        <Environment preset="city" environmentIntensity={0.2} />
      </Canvas>

      <div style={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        display: 'flex',
        gap: 4,
        background: 'rgba(10, 14, 26, 0.9)',
        borderRadius: 8,
        padding: '4px',
      }}>
        {['translate', 'rotate', 'scale'].map((mode) => (
          <button
            key={mode}
            onClick={() => setTransformMode(mode)}
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              border: 'none',
              background: transformMode === mode ? '#f7c948' : 'rgba(255,255,255,0.05)',
              color: transformMode === mode ? '#0a0e1a' : '#94a3b8',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {mode}
          </button>
        ))}
      </div>

      <div style={{
        position: 'absolute',
        top: 12,
        left: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        background: 'rgba(10, 14, 26, 0.9)',
        borderRadius: 8,
        padding: '6px',
      }}>
        {Object.keys(ELEMENT_TYPES).map((type) => (
          <button
            key={type}
            onClick={() => addElement(type)}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: 'none',
              background: 'rgba(255,255,255,0.05)',
              color: '#e2e8f0',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: ELEMENT_TYPES[type].defaultColor,
              display: 'inline-block',
            }} />
            {ELEMENT_TYPES[type].label}
          </button>
        ))}
      </div>
    </div>
  );
}
