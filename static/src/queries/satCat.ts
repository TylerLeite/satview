import { useQuery } from '@tanstack/react-query';
import type { SatCat } from '../components/Satellites/types';

export function useSatCatQuery() {
    return useQuery<SatCat[]>({
        queryKey: ['satcat'],
        queryFn: async () => {
            const res = await fetch('/satcat.json');
            if (!res.ok) { throw new Error("Error fetching satcat details"); }
            return res.json();
        },
    });
}