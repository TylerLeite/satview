import { useState, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

import { useSplosionStore } from '../../stores/splosion';

export default function Splosion() {
    const vertexBufferRef = useRef<THREE.BufferAttribute>(null);
    const colorBufferRef = useRef<THREE.BufferAttribute>(null);

    const n = useSplosionStore(s => s.n);
    const r = useSplosionStore(s => s.r);
    const life = useSplosionStore(s => s.life);
    const lifespan = useSplosionStore(s => s.lifespan);
    const tick = useSplosionStore(s => s.tick);

    const positions = useMemo(() => {
        const initialPositions = new Float32Array(n * 3);
        for (let i = 0; i < n * 3; i += 3) {
            initialPositions[i + 0] = r.X;
            initialPositions[i + 1] = r.Y;
            initialPositions[i + 2] = r.Z;
        }
        return initialPositions;
    }, [n, r.X, r.Y, r.Z]);

    const maxSpeed = 1;
    const [velocities] = useState(() => {
        const initialVelocities = new Float32Array(n * 3);
        for (let i = 0; i < n * 3; i += 3) {
            initialVelocities[i + 0] = (1 - 2 * Math.random()) * maxSpeed;
            initialVelocities[i + 1] = (1 - 2 * Math.random()) * maxSpeed;
            initialVelocities[i + 2] = (1 - 2 * Math.random()) * maxSpeed;
        }
        return initialVelocities;
    });

    const colors = useMemo(() => {
        const initialColors = new Float32Array(n * 4);
        for (let i = 0; i < n * 4; i += 4) {
            initialColors[i + 0] = 1;
            initialColors[i + 1] = i / n;
            initialColors[i + 2] = 0;
            initialColors[i + 3] = 1;
        }
        return initialColors;
    }, [n]);

    useFrame((_, dt) => {
        if (life <= 0) { return; }
        if (!positions || !vertexBufferRef.current || !colorBufferRef.current) { return; }
        const newPositions = vertexBufferRef.current.array as Float32Array;

        for (let i = 0; i < newPositions.length; i += 3) {
            newPositions[i + 0] = positions[i + 0] + velocities[i + 0] * dt;
            newPositions[i + 1] = positions[i + 1] + velocities[i + 1] * dt;
            newPositions[i + 2] = positions[i + 2] + velocities[i + 2] * dt;
        }
        vertexBufferRef.current.needsUpdate = true;

        const newColors = colorBufferRef.current.array as Float32Array;
        for (let i = 3; i < newColors.length; i += 4) {
            newColors[i] = life/lifespan;
        }
        colorBufferRef.current.needsUpdate = true;

        tick();
    });

    if (life <= 0) { return null; }

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute
                    ref={vertexBufferRef}
                    attach="attributes-position"
                    count={n}
                    args={[positions, 3]}
                    usage={THREE.DynamicDrawUsage}
                ></bufferAttribute>

                <bufferAttribute
                    ref={colorBufferRef}
                    attach="attributes-color"
                    count={n}
                    args={[colors, 4]}
                    usage={THREE.DynamicDrawUsage}
                ></bufferAttribute>
            </bufferGeometry>

            <pointsMaterial
                size={0.01}
                vertexColors
                transparent={true}
                sizeAttenuation={true}
            ></pointsMaterial>
        </points>
    );
}