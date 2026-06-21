import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

function LightningBolt() {
  const meshRef = useRef();
  const glowRef = useRef();

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.3, 1.2);
    s.lineTo(0.15, 0.3);
    s.lineTo(-0.05, 0.3);
    s.lineTo(0.3, -1.2);
    s.lineTo(-0.15, -0.1);
    s.lineTo(0.05, -0.1);
    s.closePath();
    return s;
  }, []);

  const extrudeSettings = useMemo(() => ({
    depth: 0.25,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.06,
    bevelSegments: 4,
  }), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(t * 0.5) * 0.3 + t * 0.15;
      meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.1;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.08);
      glowRef.current.material.opacity = 0.3 + Math.sin(t * 3) * 0.15;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={[0, 0, -0.125]} castShadow>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial
          color="#f7c948"
          metalness={0.85}
          roughness={0.15}
          emissive="#f7c948"
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh ref={glowRef} position={[0, 0, -0.2]}>
        <extrudeGeometry args={[shape, { ...extrudeSettings, bevelSize: 0.3, bevelThickness: 0.3 }]} />
        <meshBasicMaterial color="#f7c948" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export default function SparkLogo({ size = 200, className = '' }) {
  return (
    <div className={`spark-logo ${className}`} style={{ width: size, height: size }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
        <pointLight position={[-3, 2, 2]} intensity={0.8} color="#f7c948" />
        <spotLight position={[0, 4, 4]} intensity={0.6} angle={0.5} penumbra={0.5} color="#ffffff" />

        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <LightningBolt />
        </Float>

        <Environment preset="city" environmentIntensity={0.5} />
      </Canvas>
    </div>
  );
}
