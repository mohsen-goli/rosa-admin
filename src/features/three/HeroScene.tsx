import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { AnimatedSphere } from "./AnimatedSphere";

export function HeroScene() {
  return (
    <div className="relative h-64 lg:h-80 rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} color="#ec4899" intensity={2} />
        <pointLight position={[-5, -5, -5]} color="#a855f7" intensity={2} />

        <AnimatedSphere />

        <Stars
          radius={50}
          depth={30}
          count={1500}
          factor={3}
          saturation={0}
          fade
        />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <h1 className="text-3xl lg:text-4xl font-bold text-white">
          Welcome to <span className="text-pink-400">Rosa</span> Admin
        </h1>
        <p className="text-slate-300 mt-2 text-sm">
          Move your mouse to interact
        </p>
      </div>
    </div>
  );
}
