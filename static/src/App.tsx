import './App.css';

import { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTexture, OrbitControls } from '@react-three/drei';

import Satellites from './components/Satellites/Satellites';

import type { Dispatch, SetStateAction } from 'react';

const EARTH_RADIUS_ACTUAL = 6378;
const EARTH_RADIUS_VIRTUAL = 10;
const SCALE = EARTH_RADIUS_VIRTUAL / EARTH_RADIUS_ACTUAL;

const MIN_DISTANCE = 13;
const THRESHOLD = 0.02;

const SPEED_MULTIPLIER = 10;


type SceneProps = {
  setThreshold: Dispatch<SetStateAction<number>>;
}
const Scene: React.FC<SceneProps> = ({ setThreshold  }) => {
  const texture = useTexture('/earth.png');

  // NOTE: a day is long, this rotation will hardly be noticeable. but it makes me feel better to include it
  const earthRef = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    const speed = Math.PI*2/(24*60*60) // rad / s
    earthRef.current.rotation.y += speed * delta * SPEED_MULTIPLIER;
  });
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <group rotation={[-Math.PI / 2, 0, 23.5 / 360 * 2 * Math.PI]}>
        <mesh ref={earthRef} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[EARTH_RADIUS_VIRTUAL, 64, 64]} />
          <meshStandardMaterial map={texture} />
        </mesh>
        <Satellites scale={SCALE} speedMultiplier={SPEED_MULTIPLIER}></Satellites>
      </group>
      <OrbitControls
        minDistance={MIN_DISTANCE}
        maxDistance={500}
        onChange={(e) => {
          const d = e?.target.getDistance();
          if (!d) { return; }
          setThreshold(THRESHOLD * Math.sqrt(d/MIN_DISTANCE));
        }}
        />
    </>
  )
}


function App() {
  const [threshold, setThreshold] = useState(THRESHOLD);
  return (
    <>
      <Canvas
        raycaster={{ params: {
          ...THREE.Raycaster.prototype.params,
           Points: { threshold} 
        } }}
        camera={{ position: [0, 0, MIN_DISTANCE]}}
      >
        <color attach="background" args={["#111111"]}></color>
        <Scene setThreshold={setThreshold}></Scene>
      </Canvas>
    </>
  )
}

export default App;
