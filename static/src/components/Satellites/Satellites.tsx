import { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

import type {SatRec} from './types.d.ts';

import type { ThreeEvent } from '@react-three/fiber';

type SatellitesProps = {
  scale: number;
};

const Satellites: React.FC<SatellitesProps> = ({ scale }) => {
    const [positions, setPositions] = useState<Float32Array | null>(null);

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

    useEffect(() => {
        fetch("/satellites.json").then(res => res.json()).then(
            (data: Array<SatRec>) => {
                const buf = new Float32Array(data.length * 3);
                data.forEach((sat, i) => {
                    buf[i * 3] = sat.r.X * scale;
                    buf[i * 3 + 1] = sat.r.Y * scale;
                    buf[i * 3 + 2] = sat.r.Z * scale;
                });

                setPositions(buf);
            }
        )
    }, [scale]);

    if (!positions) { return null; } // TODO: As of now, loading happens quickly enough that this is fine

    const updateHover = (e: ThreeEvent<PointerEvent>) => {
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
        if (e.index == null) { return; }

        colors.current[e.index * 3] = 1;
        colors.current[e.index * 3 + 1] = 1;
        colors.current[e.index * 3 + 2] = 1;
        hoveredRef.current.needsUpdate = true;

        setHoveredIdx(null);
    }

    // const clickSatellite = (e: ThreeEvent<PointerEvent>) => {
    //   // Select this guy
    //   // publish a message that he was selected
    //   // TODO: in hove/unhover logic, make sure it doesnt get unhighlighted if it is selected
    // }

    return (
        <points
            onPointerMove={updateHover}
            // onPointerDown={clickSatellite}
            onPointerOut={unHover}
        >
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    args={[positions, 3]}
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