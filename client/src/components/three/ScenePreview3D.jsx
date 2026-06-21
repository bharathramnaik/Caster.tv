import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Text } from '@react-three/drei';

function TemplateFrame() {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
  });

  return (
    <group ref={groupRef} rotation={[0.2, -0.3, 0]}>
      <RoundedBox args={[4, 2.25, 0.05]} radius={0.05} smoothness={4} position={[0, 0, 0]}>
        <meshStandardMaterial color="#0a0e1a" metalness={0.2} roughness={0.8} />
      </RoundedBox>

      <RoundedBox args={[3.8, 2.05, 0.04]} radius={0.03} smoothness={4} position={[0, 0, 0.03]}>
        <meshStandardMaterial color="#111827" metalness={0.1} roughness={0.9} />
      </RoundedBox>

      <RoundedBox args={[3.6, 0.25, 0.02]} radius={0.02} smoothness={2} position={[0, -0.85, 0.04]}>
        <meshStandardMaterial color="#1a2235" metalness={0.3} roughness={0.6} />
      </RoundedBox>

      <Text
        position={[0, 0.4, 0.05]}
        fontSize={0.35}
        color="#f7c948"
        anchorX="center"
        fontWeight="bold"
      >
        TEAM A vs TEAM B
      </Text>

      <Text
        position={[0, 0, 0.05]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        fontWeight="bold"
      >
        142/5
      </Text>

      <Text
        position={[0, -0.35, 0.05]}
        fontSize={0.18}
        color="#94a3b8"
        anchorX="center"
      >
        Overs: 15.3 | RR: 9.16
      </Text>

      {[0.3, 0.9, 1.5, 2.1, 2.7].map((x, i) => (
        <group key={i} position={[x - 1.5, -0.85, 0.05]}>
          <mesh>
            <planeGeometry args={[0.45, 0.15]} />
            <meshBasicMaterial color={i < 3 ? '#22c55e' : i === 3 ? '#f7c948' : '#ef4444'} transparent opacity={0.8} />
          </mesh>
        </group>
      ))}

      <RoundedBox args={[0.6, 0.6, 0.02]} radius={0.1} smoothness={4} position={[-1.5, 0, 0.05]}>
        <meshStandardMaterial color="#3b82f6" metalness={0.4} roughness={0.3} />
      </RoundedBox>
      <RoundedBox args={[0.6, 0.6, 0.02]} radius={0.1} smoothness={4} position={[1.5, 0, 0.05]}>
        <meshStandardMaterial color="#ef4444" metalness={0.4} roughness={0.3} />
      </RoundedBox>

      <RoundedBox args={[3.8, 0.02, 0.02]} radius={0.01} smoothness={2} position={[0, 0.95, 0.05]}>
        <meshStandardMaterial color="#f7c948" emissive="#f7c948" emissiveIntensity={0.5} />
      </RoundedBox>
    </group>
  );
}

export default function ScenePreview3D({ className = '' }) {
  return (
    <div className={`scene-preview-3d ${className}`} style={{ width: '100%', height: '100%', minHeight: 400 }}>
      <Canvas camera={{ position: [0, 1.5, 4], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <pointLight position={[-3, 3, 2]} intensity={0.5} color="#f7c948" />

        <TemplateFrame />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.8}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}
