import { useRef, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, RoundedBox, Plane, OrbitControls, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedScore({ value, position, color = '#ffffff', fontSize = 0.6 }) {
  const ref = useRef();
  const currentVal = useRef(0);
  const targetVal = typeof value === 'number' ? value : parseInt(value) || 0;

  useFrame(() => {
    currentVal.current += (targetVal - currentVal.current) * 0.08;
    if (ref.current) {
      ref.current.text = String(Math.round(currentVal.current));
    }
  });

  return (
    <Text
      ref={ref}
      position={position}
      fontSize={fontSize}
      color={color}
      anchorX="center"
      anchorY="middle"
      fontWeight="bold"
      font="https://fonts.gstatic.com/s/teko/v20/LYjYdG7kmE0gV69VVPPdFl06VN9JG7S6.woff2"
    >
      0
    </Text>
  );
}

function TeamLogo({ color, position, rotation = [0, 0, 0], label }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.3;
    }
  });

  return (
    <group ref={ref} position={position} rotation={rotation}>
      <RoundedBox args={[0.8, 0.8, 0.05]} radius={0.1} smoothness={4}>
        <meshStandardMaterial
          color={color}
          metalness={0.6}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </RoundedBox>
      <Text
        position={[0, 0, 0.04]}
        fontSize={0.28}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {label}
      </Text>
    </group>
  );
}

function GlassPanel({ children, position, width = 4, height = 1.5, opacity = 0.15 }) {
  return (
    <group position={position}>
      <RoundedBox args={[width, height, 0.03]} radius={0.05} smoothness={4}>
        <meshPhysicalMaterial
          color="#1a2235"
          metalness={0.1}
          roughness={0.15}
          transmission={0.6}
          thickness={0.5}
          transparent
          opacity={0.85}
          envMapIntensity={1}
        />
      </RoundedBox>
      <RoundedBox args={[width - 0.04, height - 0.04, 0.02]} radius={0.03} smoothness={4} position={[0, 0, 0.02]}>
        <meshPhysicalMaterial
          color="#0a0e1a"
          metalness={0.05}
          roughness={0.3}
          transparent
          opacity={opacity}
        />
      </RoundedBox>
      {children}
    </group>
  );
}

function ScoreBoardInner({
  teamA = { name: 'TEAM A', short: 'A', color: '#1a237e', score: 142 },
  teamB = { name: 'TEAM B', short: 'B', color: '#b71c1c', score: 98 },
  overs = '15.3',
  extras = '',
  status = 'LIVE',
}) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      <GlassPanel position={[0, 0.6, 0]} width={5.5} height={1.8}>
        <Text position={[-1.8, 0.5, 0.03]} fontSize={0.12} color="#f7c948" anchorX="center" letterSpacing={0.15}>
          {status}
        </Text>
        <TeamLogo color={teamA.color} position={[-2.1, -0.1, 0.03]} label={teamA.short} />
        <Text position={[-1.2, -0.1, 0.03]} fontSize={0.2} color="#e2e8f0" anchorX="left" fontWeight="bold">
          {teamA.name}
        </Text>
        <AnimatedScore value={teamA.score} position={[-0.3, -0.1, 0.04]} color="#ffffff" fontSize={0.5} />
      </GlassPanel>

      <GlassPanel position={[0, -0.6, 0]} width={5.5} height={1.8}>
        <TeamLogo color={teamB.color} position={[-2.1, -0.1, 0.03]} label={teamB.short} />
        <Text position={[-1.2, -0.1, 0.03]} fontSize={0.2} color="#e2e8f0" anchorX="left" fontWeight="bold">
          {teamB.name}
        </Text>
        <AnimatedScore value={teamB.score} position={[-0.3, -0.1, 0.04]} color="#ffffff" fontSize={0.5} />
        <Text position={[0.8, -0.1, 0.03]} fontSize={0.13} color="#94a3b8" anchorX="left">
          ({overs} ov)
        </Text>
      </GlassPanel>

      <group position={[0, 0, 0.05]}>
        <RoundedBox args={[0.04, 2.8, 0.02]} radius={0.01} smoothness={2}>
          <meshStandardMaterial color="#f7c948" emissive="#f7c948" emissiveIntensity={0.4} />
        </RoundedBox>
      </group>

      <RoundedBox args={[5.6, 0.04, 0.02]} radius={0.01} smoothness={2} position={[0, 1.55, 0.02]}>
        <meshStandardMaterial color="#f7c948" emissive="#f7c948" emissiveIntensity={0.5} />
      </RoundedBox>
      <RoundedBox args={[5.6, 0.04, 0.02]} radius={0.01} smoothness={2} position={[0, -1.55, 0.02]}>
        <meshStandardMaterial color="#f7c948" emissive="#f7c948" emissiveIntensity={0.5} />
      </RoundedBox>

      {extras && (
        <Text position={[0, -1.3, 0.03]} fontSize={0.1} color="#64748b" anchorX="center">
          {extras}
        </Text>
      )}
    </group>
  );
}

function CameraController({ view = 'front' }) {
  const { camera } = useThree();

  useFrame(() => {
    const targets = {
      front: { pos: [0, 0, 5], look: [0, 0, 0] },
      top: { pos: [0, 5, 2], look: [0, 0, 0] },
      side: { pos: [5, 1, 2], look: [0, 0, 0] },
      angled: { pos: [3, 2, 4], look: [0, 0, 0] },
    };
    const t = targets[view] || targets.front;
    camera.position.lerp(new THREE.Vector3(...t.pos), 0.03);
    camera.lookAt(new THREE.Vector3(...t.look));
  });

  return null;
}

export default function Scoreboard3D({
  teamA,
  teamB,
  overs,
  extras,
  status,
  cameraView = 'front',
  className = '',
}) {
  return (
    <div className={`scoreboard-3d ${className}`} style={{ width: '100%', height: '100%', minHeight: 400 }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <pointLight position={[-3, 3, 2]} intensity={0.5} color="#f7c948" />
        <spotLight position={[0, 4, 4]} intensity={0.4} angle={0.5} penumbra={0.5} />

        <ScoreBoardInner teamA={teamA} teamB={teamB} overs={overs} extras={extras} status={status} />

        <CameraController view={cameraView} />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={10}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.5}
          enableDamping
          dampingFactor={0.05}
        />
        <Environment preset="city" environmentIntensity={0.3} />
      </Canvas>
    </div>
  );
}
