import './List.css';

import { useSelectedStore } from '../../stores/selected';

import type { SatRec } from '../Satellites/types';
import use3leQuery from '../../queries/sat3le';

function ListCard(detail: SatRec) {
    return(<>
        <div>
            {detail.name} ({detail.satnum})
        </div>
    </>);
}

export default function List() {
    const { data: satDetails, isLoading, isError } = use3leQuery();
    const selectSatellite = useSelectedStore(s => s.select);

    if (isLoading || isError) { return; }

    const cards = satDetails?.map((e: SatRec, i: number) => { 
        return <span onClick={() => selectSatellite(i)}><ListCard key={i} {...e} /></span>
    })

    return (<>
        <div className="flex-col list">
            {cards}
        </div>
    </>);
}
