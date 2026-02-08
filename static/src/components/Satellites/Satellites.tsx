import { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import use3leQuery from '../../queries/sat3le.ts';
import { useGPUSimulation } from './simulate.ts';
import { useSelectedStore } from '../../stores/selected.ts';
import { useSplosionStore } from '../../stores/splosion.ts';
import { useFilterStore } from '../../stores/filter.ts';

import type { ThreeEvent } from '@react-three/fiber';
import type { SatRec } from './types';

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

    const colorBufferRef = useRef<THREE.BufferAttribute>(null!);
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    const _colors = useMemo(() => {
        if (!positions) { return new Float32Array(0); }

        const satColors = new Float32Array(4 * positions.length / 3); // divide by 3 and then multiply by 3
        satColors.fill(1);
        return satColors;
    }, [positions]);

    const colors = useRef(_colors);
    useEffect(() => {
        colors.current = _colors;
    }, [_colors]);

    const splodedSatellites = useSplosionStore(s => s.splodedSatellites);
    useEffect(() => {
        if (!colorBufferRef.current) { return; }
        for (const idx of splodedSatellites.keys()) {
            colors.current[idx * 4 + 3] = 0;
        }
        colorBufferRef.current.needsUpdate = true;
    }, [splodedSatellites])

    const selectSatellite = useSelectedStore(s => s.select);

    const resetSplosion = useSplosionStore(s => s.reset);
    const setSploded = useSplosionStore(s => s.setSploded);
    const splodeMode = useSplosionStore(s => s.splodeMode);

    const searchFilter = useFilterStore(s => s.search);

    const splodedSatellites_rev = useSplosionStore(s => s.splodedSatellites_rev);
    useEffect(() => {
        if (!colorBufferRef.current) { return; }

        satRecs?.forEach((e: SatRec, idx: number) => {
            const i = idx*4;
            if (e.name.includes(searchFilter)) {
                if (splodedSatellites_rev.has(e.satnum)) {
                    colors.current[i + 3] = 0;
                } else {
                    colors.current[i + 3] = 1;
                }
            } else {
                colors.current[i + 3] = 0;
            }
        });

        colorBufferRef.current.needsUpdate = true;
    }, [searchFilter, satRecs, splodedSatellites_rev]);

    // TODO: As of now, loading happens quickly enough that this is fine
    // TODO: Error state
    if (isLoading || isError || !positions ) {return null}

    const updateHover = (e: ThreeEvent<PointerEvent>) => {
        if (e.index == null) { return; }
        
        if (!satRecs || !satRecs[e.index].name.includes(searchFilter)) {
            setHoveredIdx(null);
            return;
        }
        
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
        
        if (e.index != hoveredIdx) {
            if (hoveredIdx !== null) {
                colors.current[hoveredIdx * 4] = 1;
                colors.current[hoveredIdx * 4 + 1] = 1;
                colors.current[hoveredIdx * 4 + 2] = 1;
            }

            setHoveredIdx(e.index);

            colors.current[e.index * 4] = 1;
            colors.current[e.index * 4 + 1] = 0;
            colors.current[e.index * 4 + 2] = 0;

            colorBufferRef.current.needsUpdate = true;
        }
    }

    const unHover = (e: ThreeEvent<PointerEvent>) => {
        document.body.style.cursor = 'auto';
        if (e.index == null) { return; }

        colors.current[e.index * 4] = 1;
        colors.current[e.index * 4 + 1] = 1;
        colors.current[e.index * 4 + 2] = 1;
        colorBufferRef.current.needsUpdate = true;

        setHoveredIdx(null);
    }

    const clickSatellite = (e: ThreeEvent<PointerEvent>) => {
        if (!e) { return; }

        if (typeof e.index == "undefined") {
            selectSatellite(-1, {x: 0, y: 0, z: 0});
        } else {
            if (!satRecs || !satRecs[e.index].name.includes(searchFilter)) {
                return;
            }

            e.stopPropagation();

            if (splodeMode) {
                resetSplosion(e.point.x, e.point.y, e.point.z);
                setSploded(e.index, satRecs[e.index].satnum);
            } else {
                selectSatellite(e.index, e.point);
            }
        }
        // TODO: in hover/unhover logic, make sure it doesnt get unhighlighted if it is selected
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
                    ref={colorBufferRef}
                    attach="attributes-color"
                    count={_colors.length / 4}
                    args={[_colors, 4]}
                    usage={THREE.DynamicDrawUsage}
                ></bufferAttribute>
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                vertexColors
                transparent={true}
                sizeAttenuation={true}
            ></pointsMaterial>
        </points>
    )
}

export default Satellites;