import { useQuery } from '@tanstack/react-query';
import type { SatDetail } from '../components/Satellites/types';

export function useDetailsQuery() {
    return useQuery<SatDetail[]>({
        queryKey: ['details'],
        queryFn: async () => {
            const res = await fetch('/ucs.json');
            if (!res.ok) { throw new Error("Error fetching satellite details"); }
            return res.json();
        },
    });
}