import './App.css';

import { useState, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, OrbitControls } from '@react-three/drei';

import { useDetailStore } from './stores/details';

import Satellites from './components/Satellites/Satellites';
import List from './components/List/List';

import type { Dispatch, SetStateAction } from 'react';

const queryClient = new QueryClient();

const EARTH_RADIUS_ACTUAL = 6378;
const EARTH_RADIUS_VIRTUAL = 10;
const SCALE = EARTH_RADIUS_VIRTUAL / EARTH_RADIUS_ACTUAL;

const MIN_DISTANCE = 13;
const THRESHOLD = 0.02;

type SceneProps = {
  setThreshold: Dispatch<SetStateAction<number>>;
  speedMultiplier: number
}
function Scene({ setThreshold, speedMultiplier }: SceneProps) {
  const texture = useTexture('/earth.png');

  // NOTE: a day is long, this rotation will hardly be noticeable. but it makes me feel better to include it
  const earthRef = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    const speed = Math.PI*2/(24*60*60) // rad / s
    earthRef.current.rotation.y += speed * delta * speedMultiplier;
  });
  
  return (<>
    <ambientLight intensity={0.5} />
    <pointLight position={[10, 10, 10]} />
    <group rotation={[-Math.PI / 2, 0, 23.5 / 360 * 2 * Math.PI]}>
      <mesh ref={earthRef} rotation={[Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[EARTH_RADIUS_VIRTUAL, 64, 64]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      <Satellites scale={SCALE} speedMultiplier={speedMultiplier}></Satellites>
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
  </>);
}

function OrbitSystem() {
  const [threshold, setThreshold] = useState(THRESHOLD);
  const speedMultiplier = 1;

  return (<>
    <Canvas
      raycaster={{
        params: {
          ...THREE.Raycaster.prototype.params,
          Points: { threshold }
        }
      }}
      camera={{ position: [0, 0, MIN_DISTANCE*1.5] }}
    >
      <color attach="background" args={["#111111"]}></color>
      <Scene setThreshold={setThreshold} speedMultiplier={speedMultiplier}></Scene>
    </Canvas>
  </>);
}

function Details() {
  return(<>
    <p>No data available</p>
  </>)
}

function App() {
  const selected = useDetailStore(s => s.selectedIdx);
  
  return (<><QueryClientProvider client={queryClient}>
    <div className="left flex-col">
      <div className="header-toolbar">
        <input type="text"></input>
      </div>

      <div className="orbit-system"><OrbitSystem></OrbitSystem></div>

      <div className="footer-toolbar">
        <p>31222 Satellites | Speed <span style={{ color: "#19f705"}}>1x</span> 10x 100x 1,000x 10,000x 100,000x | Distance from Earth: 9823m</p>
      </div>
    </div>

    <div className="right">
      {selected != -1 ? <Details /> : <List />}
    </div>
  </QueryClientProvider></>)
}

export default App;
