import { Canvas, useFrame } from '@react-three/fiber';
import {
  Environment,
  Lightformer,
  MeshTransmissionMaterial,
} from '@react-three/drei';
import { useRef } from 'react';
import type { Group } from 'three';

function Sculpture() {
  const group = useRef<Group>(null);
  useFrame(({ clock, pointer }, delta) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.rotation.y += delta * 0.13;
    group.current.rotation.x =
      0.35 + Math.sin(t * 0.22) * 0.16 + pointer.y * 0.1;
    group.current.position.y = Math.sin(t * 0.5) * 0.1;
  });
  return (
    <group ref={group} rotation={[0.35, 0, -0.5]}>
      <mesh>
        <torusKnotGeometry args={[1.25, 0.38, 180, 24, 2, 3]} />
        <MeshTransmissionMaterial
          resolution={256}
          samples={3}
          thickness={1.2}
          roughness={0.12}
          transmission={1}
          ior={1.3}
          chromaticAberration={0.035}
          anisotropy={0.15}
          color="#bce6ff"
        />
      </mesh>
      <mesh position={[1.6, -0.8, 0.3]}>
        <sphereGeometry args={[0.19, 24, 24]} />
        <meshStandardMaterial
          metalness={0.9}
          roughness={0.14}
          color="#bdff80"
        />
      </mesh>
    </group>
  );
}
export default function LiquidScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.6], fov: 40 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      fallback={<div className="pf-orb-fallback" />}
    >
      <ambientLight intensity={0.5} />
      <Sculpture />
      <Environment resolution={128}>
        <Lightformer position={[0, 3, 4]} scale={[8, 3, 1]} intensity={4} />
        <Lightformer
          position={[-4, 0, 2]}
          scale={[3, 6, 1]}
          color="#829aff"
          intensity={5}
        />
        <Lightformer
          position={[4, -2, 2]}
          scale={[3, 4, 1]}
          color="#bfff95"
          intensity={3}
        />
      </Environment>
    </Canvas>
  );
}
