import { create } from 'zustand';

interface FilterState {
    search: string;
};

interface FilterAction {
    setSearch: (s: string) => void;
}

const useFilterStore = create<FilterState & FilterAction>(
    (set) => ({
        search: "",
        setSearch: (s: string) => set(() => ({ search: s })), 
    })
);

export { useFilterStore };