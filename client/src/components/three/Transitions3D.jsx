import { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, RoundedBox, Environment } from '@react-three/drei';
import * as THREE from 'three';

function CubeRotationTransition({ progress = 0, children, bgColor = '#0a0e1a' }) {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = progress * Math.PI * 2;
      groupRef.current.position.z = Math.sin(progress * Math.PI) * 2;
    }
  });

  return (
    <group ref={groupRef}>
      <RoundedBox args={[2.5, 1.5, 0.05]} radius={0.05} smoothness={4}>
        <meshPhysicalMaterial
          color={bgColor}
          metalness={0.3}
          roughness={0.2}
          transmission={0.4}
          thickness={0.5}
          transparent
          opacity={0.95}
        />
      </RoundedBox>
      <group position={[0, 0, 0.04]}>
        {children}
      </group>
    </group>
  );
}

function SphereMorphTransition({ progress = 0, children, bgColor = '#0a0e1a' }) {
  const meshRef = useRef();
  const targetScale = useRef(1);

  useFrame(() => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(progress * Math.PI) * 0.5;
      meshRef.current.scale.setScalar(scale);
      meshRef.current.rotation.y = progress * Math.PI;
      meshRef.current.rotation.x = progress * Math.PI * 0.5;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshPhysicalMaterial
          color={bgColor}
          metalness={0.4}
          roughness={0.3}
          transmission={0.5}
          thickness={0.5}
          transparent
          opacity={0.9}
          wireframe={progress < 0.5}
        />
      </mesh>
      <group position={[0, 0, 1.5 * (1 - Math.abs(progress - 0.5) * 2)]}>
        {children}
      </group>
    </group>
  );
}

function ParticleDissolveTransition({ progress = 0, children, particleCount = 200, bgColor = '#0a0e1a' }) {
  const particlesRef = useRef();

  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < particleCount; i++) {
      arr.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 1
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.01
        ),
        size: Math.random() * 0.05 + 0.02,
        color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.12, 0.8, 0.6),
      });
    }
    return arr;
  }, [particleCount]);

  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.children.forEach((child, i) => {
        const p = particles[i];
        if (p) {
          const dissolve = Math.sin(progress * Math.PI);
          child.position.copy(p.position).add(p.velocity.clone().multiplyScalar(dissolve * 50));
          child.scale.setScalar(dissolve);
          child.material.opacity = dissolve;
        }
      });
    }
  });

  return (
    <group>
      <group ref={particlesRef}>
        {particles.map((p, i) => (
          <mesh key={i} position={p.position}>
            <sphereGeometry args={[p.size, 8, 8]} />
            <meshBasicMaterial color={p.color} transparent opacity={0} />
          </mesh>
        ))}
      </group>
      <group position={[0, 0, 0.1]} scale={1 - progress * 0.3}>
        {children}
      </group>
    </group>
  );
}

function PageFlipTransition({ progress = 0, children, bgColor = '#0a0e1a' }) {
  const pageRef = useRef();

  useFrame(() => {
    if (pageRef.current) {
      const angle = progress * Math.PI;
      pageRef.current.rotation.y = angle;
      pageRef.current.position.x = Math.sin(angle) * 0.5;
    }
  });

  return (
    <group>
      <group ref={pageRef}>
        <RoundedBox args={[2.5, 1.5, 0.02]} radius={0.02} smoothness={2} position={[0, 0, 0]}>
          <meshPhysicalMaterial
            color={bgColor}
            metalness={0.1}
            roughness={0.4}
            transparent
            opacity={0.95}
            side={THREE.DoubleSide}
          />
        </RoundedBox>
        <group position={[0, 0, 0.02]}>
          {children}
        </group>
      </group>
      <group position={[0, 0, -0.01]} rotation={[0, Math.PI, 0]} scale={[-1, 1, 1]}>
        <RoundedBox args={[2.5, 1.5, 0.02]} radius={0.02} smoothness={2}>
          <meshPhysicalMaterial
            color="#111827"
            metalness={0.1}
            roughness={0.4}
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </RoundedBox>
      </group>
    </group>
  );
}

function TransitionPreview({ type, progress, children, bgColor }) {
  switch (type) {
    case 'cube':
      return <CubeRotationTransition progress={progress} bgColor={bgColor}>{children}</CubeRotationTransition>;
    case 'sphere':
      return <SphereMorphTransition progress={progress} bgColor={bgColor}>{children}</SphereMorphTransition>;
    case 'particle':
      return <ParticleDissolveTransition progress={progress} bgColor={bgColor}>{children}</ParticleDissolveTransition>;
    case 'pageflip':
      return <PageFlipTransition progress={progress} bgColor={bgColor}>{children}</PageFlipTransition>;
    default:
      return <CubeRotationTransition progress={progress} bgColor={bgColor}>{children}</CubeRotationTransition>;
  }
}

function SampleContent() {
  return (
    <group>
      <RoundedBox args={[2, 1, 0.02]} radius={0.03} smoothness={2}>
        <meshStandardMaterial color="#1a2235" metalness={0.2} roughness={0.8} />
      </RoundedBox>
      <Text position={[0, 0.2, 0.02]} fontSize={0.15} color="#f7c948" anchorX="center" fontWeight="bold">
        SPORTSCASTER
      </Text>
      <Text position={[0, -0.1, 0.02]} fontSize={0.08} color="#94a3b8" anchorX="center">
        3D Transition
      </Text>
    </group>
  );
}

export default function Transitions3D({
  type = 'cube',
  progress = 0,
  autoPlay = false,
  duration = 2000,
  children,
  className = '',
  bgColor,
}) {
  const [autoProgress, setAutoProgress] = useState(0);
  const animRef = useRef(null);

  useEffect(() => {
    if (!autoPlay) return;
    let start = null;
    const animate = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const p = (elapsed % duration) / duration;
      setAutoProgress(p);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [autoPlay, duration]);

  const currentProgress = autoPlay ? autoProgress : progress;

  return (
    <div className={`transitions-3d ${className}`} style={{ width: '100%', height: '100%', minHeight: 300 }}>
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-3, 2, 2]} intensity={0.5} color="#f7c948" />

        <TransitionPreview type={type} progress={currentProgress} bgColor={bgColor}>
          {children || <SampleContent />}
        </TransitionPreview>

        <Environment preset="city" environmentIntensity={0.2} />
      </Canvas>
    </div>
  );
}

export { CubeRotationTransition, SphereMorphTransition, ParticleDissolveTransition, PageFlipTransition };
