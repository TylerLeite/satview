import './List.css';

import { useMemo, memo } from 'react';

import { useSelectedStore } from '../../stores/selected';
import { useFilterStore } from '../../stores/filter';

import type { SatRec } from '../Satellites/types';
import use3leQuery from '../../queries/sat3le';


const ListCard = memo(
    ({name, satnum, search}: SatRec & {search: string}) => 
        <div className={name.toLocaleLowerCase().includes(search) ? '' : 'hidden'}>
            {name} ({satnum})
        </div>
);

export default function List() {
    const { data: satDetails, isLoading, isError } = use3leQuery();
    const selectSatellite = useSelectedStore(s => s.select);
    const search = useFilterStore(s => s.search);
    const search_lower = useMemo(() => search.toLocaleLowerCase(), [search]);

    if (isLoading || isError) { return; }

    return (<>
        <div className="flex-col list">
            {satDetails?.map((e: SatRec, i: number) => (
                <span
                    key={e.satnum}
                    className="clickable"
                    onClick={() => selectSatellite(i)}
                >
                    <ListCard search={search_lower} {...e} />
                </span>
            ))}
        </div>
    </>);
}
