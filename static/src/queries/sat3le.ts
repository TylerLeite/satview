import { useQuery } from '@tanstack/react-query';

import type { SatRec } from '../components/Satellites/types';

export default function use3leQuery() {
    return useQuery<SatRec[]>({
        queryKey: ['satellites'],
        queryFn: async () => {
            const res = await fetch('/satellites.json');
            if (!res.ok) { throw new Error("Error fetching satellite 3les"); }
            return res.json();
        },
        refetchInterval: 5000,
    });
}