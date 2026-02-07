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
};

interface SplosionAction {
    reset: (X: number, Y: number, Z: number) => void;
    tick: () => void
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
        reset: (X: number, Y: number, Z: number) => set(() => ({ r: { X, Y, Z }, life: LIFESPAN })),
        tick: () => set((s) => ({ life: s.life - 1 })) 
    })
);

export { useSplosionStore };