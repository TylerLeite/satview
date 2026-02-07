import { create } from 'zustand';

interface SceneState {
    distance: number;
    speedMultiplier: number;
};

interface SceneAction {
    setDistance: (d: number) => void;
    setSpeedMultiplier: (k: number) => void;
}

const useSceneStore = create<SceneState & SceneAction>(
    (set) => ({
        distance: 0,
        speedMultiplier: 1,
        setDistance: (d: number) => set(() => ({ distance: d })), 
        setSpeedMultiplier: (k: number) => set(() => ({ speedMultiplier: k })), 
    })
);

export { useSceneStore };