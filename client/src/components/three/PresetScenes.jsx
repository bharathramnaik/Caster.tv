import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, RoundedBox, OrbitControls, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

const PRESET_SCENES = [
  {
    id: 'cricket-stadium',
    name: 'Cricket Stadium',
    sport: 'cricket',
    description: 'Immersive stadium view with scorecard overlay',
    camera: { position: [6, 4, 8], fov: 50 },
    lighting: { ambient: 0.5, directional: 1.2, point: 0.6 },
    elements: [
      { type: 'stadium', color: '#1a5e1f' },
      { type: 'scorecard', position: [0, 2, 0] },
      { type: 'floodlights', positions: [[-4, 5, -2], [4, 5, -2]] },
    ],
  },
  {
    id: 'cricket-scorecard',
    name: 'Cricket Scorecard',
    sport: 'cricket',
    description: 'Detailed 3D scorecard with player stats',
    camera: { position: [0, 1, 5], fov: 45 },
    lighting: { ambient: 0.4, directional: 0.8, point: 0.5 },
    elements: [
      { type: 'scorecard', position: [0, 0, 0], scale: 1.2 },
    ],
  },
  {
    id: 'cricket-player-spotlight',
    name: 'Player Spotlight',
    sport: 'cricket',
    description: 'Dramatic player spotlight scene',
    camera: { position: [3, 2, 4], fov: 40 },
    lighting: { ambient: 0.2, directional: 1.5, point: 0.8 },
    elements: [
      { type: 'spotlight-platform' },
      { type: 'player-card', position: [0, 1, 0] },
    ],
  },
  {
    id: 'football-field',
    name: 'Football Field',
    sport: 'football',
    description: 'Birds-eye football field with match stats',
    camera: { position: [0, 10, 5], fov: 60 },
    lighting: { ambient: 0.6, directional: 1, point: 0.4 },
    elements: [
      { type: 'field', color: '#16a34a' },
      { type: 'stats-board', position: [0, 3, 0] },
    ],
  },
  {
    id: 'football-match-stats',
    name: 'Match Stats',
    sport: 'football',
    description: 'Side-by-side team comparison',
    camera: { position: [0, 1, 6], fov: 50 },
    lighting: { ambient: 0.4, directional: 0.8, point: 0.5 },
    elements: [
      { type: 'stats-comparison', position: [0, 0, 0] },
    ],
  },
  {
    id: 'football-goal-replay',
    name: 'Goal Replay',
    sport: 'football',
    description: 'Goal replay with trajectory visualization',
    camera: { position: [5, 3, 5], fov: 55 },
    lighting: { ambient: 0.5, directional: 1, point: 0.6 },
    elements: [
      { type: 'field-segment' },
      { type: 'trajectory', color: '#f7c948' },
    ],
  },
  {
    id: 'basketball-court',
    name: 'Basketball Court',
    sport: 'basketball',
    description: 'Full basketball court view',
    camera: { position: [6, 6, 6], fov: 55 },
    lighting: { ambient: 0.5, directional: 1, point: 0.5 },
    elements: [
      { type: 'court', color: '#c2410c' },
      { type: 'scoreboard', position: [0, 4, 0] },
    ],
  },
  {
    id: 'basketball-quarter-stats',
    name: 'Quarter Stats',
    sport: 'basketball',
    description: 'Quarter-by-quarter breakdown',
    camera: { position: [0, 1, 5], fov: 45 },
    lighting: { ambient: 0.4, directional: 0.8, point: 0.4 },
    elements: [
      { type: 'quarter-chart', position: [0, 0, 0] },
    ],
  },
  {
    id: 'basketball-player-comparison',
    name: 'Player Comparison',
    sport: 'basketball',
    description: 'Head-to-head player comparison',
    camera: { position: [0, 1.5, 5], fov: 45 },
    lighting: { ambient: 0.4, directional: 0.9, point: 0.5 },
    elements: [
      { type: 'player-compare', positions: [[-1.5, 0, 0], [1.5, 0, 0]] },
    ],
  },
  {
    id: 'universal-scoreboard',
    name: 'Universal Scoreboard',
    sport: 'generic',
    description: 'Multi-sport 3D scoreboard',
    camera: { position: [0, 1, 5], fov: 45 },
    lighting: { ambient: 0.4, directional: 1, point: 0.5 },
    elements: [
      { type: 'universal-score', position: [0, 0, 0] },
    ],
  },
];

function StadiumGround({ color = '#1a5e1f' }) {
  return (
    <group position={[0, -0.5, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.5, 2.5, 32]} />
        <meshStandardMaterial color="#2d7a3a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.6, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function Floodlight({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 4, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.3} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={2} color="#ffffff" distance={10} />
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.3, 0.1, 0.2]} />
        <meshStandardMaterial color="#f7c948" emissive="#f7c948" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function ScorecardOverlay() {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group ref={ref}>
      <RoundedBox args={[3, 1.5, 0.05]} radius={0.08} smoothness={4}>
        <meshPhysicalMaterial
          color="#0a0e1a"
          metalness={0.2}
          roughness={0.15}
          transmission={0.5}
          thickness={0.5}
          transparent
          opacity={0.9}
        />
      </RoundedBox>
      <Text position={[0, 0.4, 0.03]} fontSize={0.12} color="#f7c948" anchorX="center" fontWeight="bold">
        INDIA vs AUSTRALIA
      </Text>
      <Text position={[-0.6, 0, 0.03]} fontSize={0.25} color="#ffffff" anchorX="center" fontWeight="bold">
        186/4
      </Text>
      <Text position={[0.6, 0, 0.03]} fontSize={0.25} color="#ffffff" anchorX="center" fontWeight="bold">
        98/2
      </Text>
      <Text position={[0, -0.4, 0.03]} fontSize={0.08} color="#94a3b8" anchorX="center">
        15.3 overs | RR: 9.16
      </Text>
    </group>
  );
}

function FootballField() {
  return (
    <group position={[0, -0.3, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#16a34a" roughness={0.9} />
      </mesh>
      <lineSegments position={[0, 0.01, 0]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(5.8, 3.8)]} />
        <lineBasicMaterial color="#ffffff" linewidth={1} />
      </lineSegments>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.4, 0.42, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function BasketballCourt() {
  return (
    <group position={[0, -0.3, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 3]} />
        <meshStandardMaterial color="#c2410c" roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.6, 0.62, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-2.2, 0.8, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.6, 8]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  );
}

function StatsBoard() {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = 2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={ref} position={[0, 2, 0]}>
      <RoundedBox args={[2.5, 1, 0.05]} radius={0.06} smoothness={4}>
        <meshPhysicalMaterial color="#0a0e1a" metalness={0.2} roughness={0.2} transmission={0.4} transparent opacity={0.9} />
      </RoundedBox>
      <Text position={[0, 0.25, 0.03]} fontSize={0.1} color="#f7c948" anchorX="center" fontWeight="bold">
        MATCH STATS
      </Text>
      <Text position={[-0.5, 0, 0.03]} fontSize={0.08} color="#60a5fa" anchorX="center">POSSESSION</Text>
      <Text position={[-0.5, -0.15, 0.03]} fontSize={0.15} color="#ffffff" anchorX="center" fontWeight="bold">62%</Text>
      <Text position={[0.5, 0, 0.03]} fontSize={0.08} color="#ef4444" anchorX="center">SHOTS</Text>
      <Text position={[0.5, -0.15, 0.03]} fontSize={0.15} color="#ffffff" anchorX="center" fontWeight="bold">14</Text>
    </group>
  );
}

function PresetSceneRenderer({ scene }) {
  const renderElements = () => {
    if (!scene?.elements) return null;
    return scene.elements.map((el, i) => {
      switch (el.type) {
        case 'stadium':
          return <StadiumGround key={i} color={el.color} />;
        case 'floodlights':
          return el.positions?.map((pos, j) => <Floodlight key={`${i}-${j}`} position={pos} />);
        case 'scorecard':
        case 'scorecard-overlay':
          return <ScorecardOverlay key={i} />;
        case 'field':
          return <FootballField key={i} />;
        case 'stats-board':
          return <StatsBoard key={i} />;
        case 'court':
          return <BasketballCourt key={i} />;
        default:
          return null;
      }
    });
  };

  return (
    <>
      <ambientLight intensity={scene?.lighting?.ambient || 0.4} />
      <directionalLight position={[5, 8, 5]} intensity={scene?.lighting?.directional || 1} castShadow />
      <pointLight position={[-3, 3, 2]} intensity={scene?.lighting?.point || 0.5} color="#f7c948" />
      {renderElements()}
      <Environment preset="city" environmentIntensity={0.3} />
    </>
  );
}

export default function PresetScenes({
  activeScene = 'cricket-stadium',
  className = '',
  onSceneSelect,
}) {
  const scene = PRESET_SCENES.find((s) => s.id === activeScene) || PRESET_SCENES[0];

  return (
    <div className={`preset-scenes ${className}`} style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: scene.camera?.position || [5, 4, 8], fov: scene.camera?.fov || 50 }}
        dpr={[1, 2]}
        shadows
      >
        <PresetSceneRenderer scene={scene} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={15}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}

export { PRESET_SCENES };
