import { create } from 'zustand';

interface SelectedState {
    selectedIdx: number;
    hoveredIdx: number;
};

interface SelectedAction {
    select: (i: number) => void;
    hover: (i: number) => void;
}

const useSelectedStore = create<SelectedState & SelectedAction>(
    (set) => ({
        selectedIdx: -1,
        hoveredIdx: -1,
        select: (i: number) => set(() => ({ selectedIdx: i })), 
        hover: (i: number) => set(() => ({ hoveredIdx: i })), 
    })
);

function useFocusedSatellite(): number {
    const focused = useSelectedStore(s => s.hoveredIdx == -1 ? s.selectedIdx : s.hoveredIdx);
    return focused;
}

export { useSelectedStore, useFocusedSatellite };