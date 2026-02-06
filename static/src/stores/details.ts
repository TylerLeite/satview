import { create } from 'zustand';

interface DetailState {
    selectedIdx: number;
};

interface DetailAction {
    select: (i: number) => void;
}

const useDetailStore = create<DetailState & DetailAction>(
    (set) => ({
        selectedIdx: -1,
        select: (i: number) => set(() => ({ selectedIdx: i })), 
    })
);

export { useDetailStore };