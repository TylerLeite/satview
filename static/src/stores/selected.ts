import { create } from 'zustand';

interface SelectedState {
    selectedIdx: number;
    hoveredIdx: number;

    X: number;
    Y: number;
    Z: number;
};

interface SelectedAction {
    select: (i: number, point: {x: number, y: number, z: number}) => void;
    hover: (i: number) => void;
}

const useSelectedStore = create<SelectedState & SelectedAction>(
    (set) => ({
        selectedIdx: -1,
        hoveredIdx: -1,
        X: 0,
        Y: 0,
        Z: 0,
        select: (i: number, point: { x: number, y: number, z: number }) => set(() => ({ selectedIdx: i, X: point.x, Y: point.y, Z: point.z })), 
        hover: (i: number) => set(() => ({ hoveredIdx: i })), 
    })
);

function useFocusedSatellite(): number {
    const focused = useSelectedStore(s => s.hoveredIdx == -1 ? s.selectedIdx : s.hoveredIdx);
    return focused;
}

export { useSelectedStore, useFocusedSatellite };