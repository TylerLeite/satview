import { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import use3leQuery from '../../queries/sat3le.ts';
import { useGPUSimulation } from './simulate.ts';
import { useSelectedStore } from '../../stores/selected.ts';

import type { ThreeEvent } from '@react-three/fiber';

type SatellitesProps = {
    scale: number;
    enableGPU?: boolean;
    speedMultiplier?: number;
};

function Satellites({ scale, enableGPU, speedMultiplier }: SatellitesProps) {
    if (typeof speedMultiplier === "undefined") {
        speedMultiplier = 1;
    }

    const vertexBufferRef = useRef<THREE.BufferAttribute>(null!);
    
    const { data: satRecs, isLoading, isError } = use3leQuery();
    
    const { positions, step, ready } = useGPUSimulation(satRecs || [], enableGPU, scale, speedMultiplier | 1, vertexBufferRef);

    useFrame((_, delta) => {
        if (!ready) { return; }
        step(delta);
    });

    const hoveredRef = useRef<THREE.BufferAttribute>(null!);
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    const _colors = useMemo(() => {
        if (!positions) { return new Float32Array(0); }

        const satColors = new Float32Array(positions.length); // divide by 3 and then multiply by 3
        satColors.fill(1);
        return satColors;
    }, [positions]);

    const colors = useRef(_colors);
    useEffect(() => {
        colors.current = _colors;
    }, [_colors]);

    const selectSatellite = useSelectedStore(s => s.select);

    // TODO: As of now, loading happens quickly enough that this is fine
    // TODO: Error state
    if (isLoading || isError || !positions ) {return null}

    const updateHover = (e: ThreeEvent<PointerEvent>) => {
        document.body.style.cursor = 'pointer';
        e.stopPropagation();

        if (e.index == null) { return; }

        if (e.index != hoveredIdx) {
            if (hoveredIdx !== null) {
                colors.current[hoveredIdx * 3] = 1;
                colors.current[hoveredIdx * 3 + 1] = 1;
                colors.current[hoveredIdx * 3 + 2] = 1;
            }

            setHoveredIdx(e.index);

            colors.current[e.index * 3] = 1;
            colors.current[e.index * 3 + 1] = 0;
            colors.current[e.index * 3 + 2] = 0;

            hoveredRef.current.needsUpdate = true;
        }
    }

    const unHover = (e: ThreeEvent<PointerEvent>) => {
        document.body.style.cursor = 'auto';
        if (e.index == null) { return; }

        colors.current[e.index * 3] = 1;
        colors.current[e.index * 3 + 1] = 1;
        colors.current[e.index * 3 + 2] = 1;
        hoveredRef.current.needsUpdate = true;

        setHoveredIdx(null);
    }

    const clickSatellite = (e: ThreeEvent<PointerEvent>) => {
        if (!e) { return; }
        if (typeof e.index == "undefined") {
            selectSatellite(-1, {x: 0, y: 0, z: 0});
        } else {
            selectSatellite(e.index, e.point);
        }
        // TODO: in hove/unhover logic, make sure it doesnt get unhighlighted if it is selected
    }

    return (
        <points
            onPointerMove={updateHover}
            onPointerDown={clickSatellite}
            onPointerOut={unHover}
        >
            <bufferGeometry>
                <bufferAttribute
                    ref={vertexBufferRef}
                    attach="attributes-position"
                    count={positions.length / 3}
                    args={[positions, 3]}
                    usage={THREE.DynamicDrawUsage}
                ></bufferAttribute>
                <bufferAttribute
                    ref={hoveredRef}
                    attach="attributes-color"
                    count={_colors.length / 3}
                    args={[_colors, 3]}
                ></bufferAttribute>
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                vertexColors
                sizeAttenuation={true}
            ></pointsMaterial>
        </points>
    )
}

export default Satellites;