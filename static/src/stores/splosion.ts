import { create } from 'zustand';

const N_PARTICLES = 100;
const LIFESPAN = 180;

interface SplosionState {
    n: number;
    r: {
        X: number;
        Y: number;
        Z: number;
    };
    life: number;
    lifespan: number;

    splodeMode: boolean;

    splodedSatellites: Map<number, boolean>;
};

interface SplosionAction {
    reset: (X: number, Y: number, Z: number) => void;
    tick: () => void;
    setSploded: (idx: number) => void;
    setSplodeMode: (to: boolean) => void;
}

const useSplosionStore = create<SplosionState & SplosionAction>(
    (set) => ({
        n: N_PARTICLES,
        r: {
            X: 0,
            Y: 0,
            Z: 0,
        },
        life: 0,
        lifespan: LIFESPAN,
        splodedSatellites: new Map<number, boolean>(),
        splodeMode: false,
        reset: (X: number, Y: number, Z: number) => set(() => ({ r: { X, Y, Z }, life: LIFESPAN })),
        tick: () => set((s) => ({ life: s.life - 1 })),
        setSploded: (idx: number) => set((s) => {
            const newSploded = new Map<number, boolean>(s.splodedSatellites);
            newSploded.set(idx, true);
            return { splodedSatellites: newSploded };
        }),
        setSplodeMode: (to: boolean) => set(() => ({splodeMode: to})),
    })
);

export { useSplosionStore };