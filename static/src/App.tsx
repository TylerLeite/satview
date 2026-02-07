import './App.css';

import { useState, useRef, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, OrbitControls } from '@react-three/drei';

import use3leQuery from './queries/sat3le';
import { useSelectedStore } from './stores/selected';
import { useSceneStore } from './stores/scene';
import { useFilterStore } from './stores/filter';

import Satellites from './components/Satellites/Satellites';
import Splosion from './components/Splosion/Splosion';
import List from './components/List/List';
import Detail from './components/Detail/Detail';

import type { Dispatch, SetStateAction } from 'react';

const queryClient = new QueryClient();

const EARTH_RADIUS_ACTUAL = 6378;
const EARTH_RADIUS_VIRTUAL = 10;
const SCALE = EARTH_RADIUS_VIRTUAL / EARTH_RADIUS_ACTUAL;

const MIN_DISTANCE = 13;
const THRESHOLD = 0.02;

type SceneProps = {
  setThreshold: Dispatch<SetStateAction<number>>;
};
function Scene({ setThreshold }: SceneProps) {
  const texture = useTexture('/earth.png');

  const speedMultiplier = useSceneStore(s => s.speedMultiplier);

  const earthRef = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    const speed = Math.PI*2/(24*60*60) // rad / s
    earthRef.current.rotation.y += speed * delta * speedMultiplier;
  });

  const setDistance = useSceneStore(s => s.setDistance);

  return (<>
    <ambientLight intensity={0.5} />
    <pointLight position={[10, 10, 10]} />
    <group rotation={[-Math.PI / 2, 0, 23.5 / 360 * 2 * Math.PI]}>
      <mesh ref={earthRef} rotation={[Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[EARTH_RADIUS_VIRTUAL, 64, 64]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      <Satellites scale={SCALE} speedMultiplier={speedMultiplier} />
    </group>
    <OrbitControls
      minDistance={MIN_DISTANCE}
      maxDistance={500}
      onChange={(e) => {
        const d = e?.target.getDistance();
        if (!d) { return; }
        setDistance(d);

        if (d > 150) {
          setThreshold(5);
        } else if (d > 100) {
          setThreshold(1)
        } else {
          setThreshold(THRESHOLD * Math.sqrt(d/MIN_DISTANCE));
        }
      }}
    />
  </>);
}

function OrbitSystem() {
  const [threshold, setThreshold] = useState(THRESHOLD);
  const setDistance = useSceneStore(s => s.setDistance);

  const startDistance = MIN_DISTANCE * 1.5;

  useEffect(() => {
    setDistance(startDistance);
  }, [setDistance, startDistance]);

  return (<>
    <Canvas
      raycaster={{
        params: {
          ...THREE.Raycaster.prototype.params,
          Points: { threshold }
        }
      }}
      camera={{ position: [0, 0, startDistance] }}
    >
      <color attach="background" args={["#111111"]}></color>
      <Scene 
        setThreshold={setThreshold}
      />
      <Splosion />
    </Canvas>
  </>);
}

// type FooterProps = {
// };
function Footer() {
  const distance = useSceneStore(s => s.distance);
  const {data: tles} = use3leQuery();

  const speedMultiplier = useSceneStore(s => s.speedMultiplier);
  const setSpeedMultiplier = useSceneStore(s => s.setSpeedMultiplier);

  let nSats = 0;
  if (tles) {
    nSats = tles.length;
  }
  
  return (<>
    <div className="footer-toolbar flex flex-row items-center justify-around">
      <p>{nSats} Satellites</p>
      <span className="speed-controls flex flex-row">
        <p>Speed:</p>
        <p className={`clickable ${speedMultiplier == 1 ? "green" : ""}`} onClick={() => setSpeedMultiplier(1)}>1x</p>
        <p className={`clickable ${speedMultiplier == 10 ? "green" : ""}`} onClick={() => setSpeedMultiplier(10)}>10x</p>
        <p className={`clickable ${speedMultiplier == 100 ? "green" : ""}`} onClick={() => setSpeedMultiplier(100)}>100x</p>
        <p className={`clickable ${speedMultiplier == 1000 ? "green" : ""}`} onClick={() => setSpeedMultiplier(1000)}>1,000x</p>
        <p className={`clickable ${speedMultiplier == 10000 ? "green" : ""}`} onClick={() => setSpeedMultiplier(10000)}>10,000x</p>
        <p className={`clickable ${speedMultiplier == 100000 ? "green" : ""}`} onClick={() => setSpeedMultiplier(100000)}>100,000x</p>
      </span>
      <p>Distance from Earth: {Math.floor(distance / SCALE - EARTH_RADIUS_ACTUAL)}km</p>
    </div>
  </>);
}

function App() {
  const selected = useSelectedStore(s => s.selectedIdx);
  const setSearch = useFilterStore(s => s.setSearch);
  
  return (<><QueryClientProvider client={queryClient}>
    <div className="left flex-col">
      <div className="header-toolbar flex flex-row items-center">
        <img src="/search.png" />
        <input 
          type="text" 
          placeholder="filter satellites"
          onFocus={(e) => e.target.placeholder=""}
          onBlur={(e) => e.target.placeholder="filter satellites"}
          onChange={(e) => setSearch(e.target.value)}
        ></input>
      </div>

      <div className="orbit-system">
        <OrbitSystem />
        </div>

      <Footer /> 
    </div>

    <div className="right flex flex-col">
      {selected != -1 ? <Detail /> : <List />}
    </div>
  </QueryClientProvider></>);
}

export default App;
