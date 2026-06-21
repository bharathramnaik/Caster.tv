import { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls, RoundedBox, Environment } from '@react-three/drei';
import * as THREE from 'three';

function Bar3D({ position, height, color, label, value, maxHeight = 5 }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const targetHeight = useRef(0);

  useFrame(() => {
    targetHeight.current += (height - targetHeight.current) * 0.05;
    if (meshRef.current) {
      meshRef.current.scale.y = Math.max(0.01, targetHeight.current / maxHeight);
      meshRef.current.position.y = (targetHeight.current / maxHeight) * maxHeight * 0.5;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <RoundedBox args={[0.6, maxHeight, 0.6]} radius={0.05} smoothness={4}>
          <meshStandardMaterial
            color={hovered ? '#ffffff' : color}
            metalness={0.3}
            roughness={0.4}
            emissive={color}
            emissiveIntensity={hovered ? 0.4 : 0.1}
          />
        </RoundedBox>
      </mesh>
      <Text
        position={[0, -0.4, 0.5]}
        fontSize={0.18}
        color="#94a3b8"
        anchorX="center"
        anchorY="top"
      >
        {label}
      </Text>
      <Text
        position={[0, height + 0.3, 0.5]}
        fontSize={0.22}
        color="#f7c948"
        anchorX="center"
        fontWeight="bold"
      >
        {String(value)}
      </Text>
      {hovered && (
        <group position={[0, height + 0.7, 0]}>
          <mesh>
            <planeGeometry args={[1.2, 0.4]} />
            <meshBasicMaterial color="#1a2235" transparent opacity={0.9} />
          </mesh>
          <Text fontSize={0.16} color="#ffffff" anchorX="center">
            {`${label}: ${value}`}
          </Text>
        </group>
      )}
    </group>
  );
}

function Globe() {
  const globeRef = useRef();

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const dots = useMemo(() => {
    const points = [];
    for (let i = 0; i < 80; i++) {
      const phi = Math.acos(-1 + (2 * i) / 80);
      const theta = Math.sqrt(80 * Math.PI) * phi;
      points.push(new THREE.Vector3(
        1.5 * Math.cos(theta) * Math.sin(phi),
        1.5 * Math.sin(theta) * Math.sin(phi),
        1.5 * Math.cos(phi)
      ));
    }
    return points;
  }, []);

  return (
    <group ref={globeRef}>
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          color="#1a2235"
          metalness={0.5}
          roughness={0.5}
          transparent
          opacity={0.6}
          wireframe
        />
      </mesh>
      {dots.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#f7c948" />
        </mesh>
      ))}
    </group>
  );
}

function BarChart({ data }) {
  const spacing = 1.2;
  const totalWidth = (data.length - 1) * spacing;

  return (
    <group position={[-totalWidth / 2, 0, 0]}>
      {data.map((item, i) => (
        <Bar3D
          key={i}
          position={[i * spacing, 0, 0]}
          height={item.value}
          color={item.color || '#3b82f6'}
          label={item.label}
          value={item.value}
          maxHeight={Math.max(...data.map(d => d.value)) * 1.2 || 5}
        />
      ))}
    </group>
  );
}

export default function DataVisualization({ type = 'bar', data = [], className = '' }) {
  return (
    <div className={`data-viz-container ${className}`} style={{ width: '100%', height: '100%', minHeight: 300 }}>
      <Canvas camera={{ position: [0, 3, 6], fov: 50 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
        <pointLight position={[-5, 5, 5]} intensity={0.5} color="#f7c948" />

        {type === 'bar' && <BarChart data={data} />}
        {type === 'globe' && <Globe />}

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={12}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
        />
        <Environment preset="city" environmentIntensity={0.3} />
      </Canvas>
    </div>
  );
}
