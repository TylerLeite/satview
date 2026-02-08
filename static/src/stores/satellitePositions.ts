import { create } from 'zustand';

interface SatellitePositionState {
    positions: Float32Array;
};

interface SatellitePositionAction {
    setPositions: (newPositions: Float32Array) => void;
}

const useSatellitePositionStore = create<SatellitePositionState & SatellitePositionAction>(
    (set) => ({
        positions: new Float32Array(0),
        setPositions: (newPositions: Float32Array) => set(() => ({ positions: newPositions })), 
    })
);

export { useSatellitePositionStore };