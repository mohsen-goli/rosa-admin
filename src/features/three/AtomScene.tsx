import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import type { Mesh, Group } from "three";

function Atom() {
  const groupRef = useRef<Group>(null);
  const electron1Ref = useRef<Mesh>(null);
  const electron2Ref = useRef<Mesh>(null);
  const electron3Ref = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.3;
      groupRef.current.rotation.x = t * 0.15;
    }

    if (electron1Ref.current) {
      electron1Ref.current.position.x = Math.cos(t * 1.5) * 1.8;
      electron1Ref.current.position.z = Math.sin(t * 1.5) * 1.8;
    }

    if (electron2Ref.current) {
      electron2Ref.current.position.y = Math.cos(t * 2) * 1.8;
      electron2Ref.current.position.x = Math.sin(t * 2) * 1.8;
    }

    if (electron3Ref.current) {
      electron3Ref.current.position.z = Math.cos(t * 1.2) * 1.8;
      electron3Ref.current.position.y = Math.sin(t * 1.2) * 1.8;
    }
  });

  return (
    <group ref={groupRef}>
      {/* هسته */}
      <mesh>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial
          color="#ec4899"
          emissive="#ec4899"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* مدارها */}
      <mesh>
        <torusGeometry args={[1.8, 0.01, 16, 100]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.8, 0.01, 16, 100]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.4} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[1.8, 0.01, 16, 100]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.4} />
      </mesh>

      {/* الکترون‌ها */}
      <mesh ref={electron1Ref}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={1.5}
        />
      </mesh>
      <mesh ref={electron2Ref}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#60a5fa"
          emissive="#60a5fa"
          emissiveIntensity={1.5}
        />
      </mesh>
      <mesh ref={electron3Ref}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#34d399"
          emissive="#34d399"
          emissiveIntensity={1.5}
        />
      </mesh>
    </group>
  );
}

export function AtomScene() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} color="#ec4899" intensity={2} />
      <pointLight position={[-5, -5, -5]} color="#a855f7" intensity={2} />

      <Atom />

      <Stars
        radius={50}
        depth={30}
        count={2000}
        factor={3}
        saturation={0}
        fade
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </Canvas>
  );
}
