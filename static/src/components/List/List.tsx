import './List.css';

import { useQuery } from '@tanstack/react-query';

import type { SatDetail } from '../Satellites/types';

function ListCard(detail: SatDetail) {
    return(<>
        <div>
            {detail.NORAD}
        </div>
    </>);
}

export default function List() {
    const { data: satDetails, isLoading, isError } = useQuery<SatDetail[]>({
        queryKey: ['details'],
        queryFn: async () => {
            const res = await fetch('/ucs.json');
            if (!res.ok) { throw new Error("Error fetching satellite details"); }
            return res.json();
        },
    });

    if (isLoading || isError) { return; }

    const cards = satDetails?.map((e: SatDetail, i: number) => { return <ListCard key={i} {...e}/>})

    return (<>
        <div className="flex-col list">
            {cards}
        </div>
    </>);
}
