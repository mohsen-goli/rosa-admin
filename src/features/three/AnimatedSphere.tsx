import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

export function AnimatedSphere() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.2;
    meshRef.current.rotation.y = t * 0.3;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.2, 1]} />
      <meshStandardMaterial
        color="#ec4899"
        emissive="#a855f7"
        emissiveIntensity={0.6}
        wireframe
      />
    </mesh>
  );
}
