import './SatList.css';

import { useMemo, memo } from 'react';

import { List } from 'react-window';

import { useSelectedStore } from '../../stores/selected';
import { useFilterStore } from '../../stores/filter';

import use3leQuery from '../../queries/sat3le';

import type { RowComponentProps } from 'react-window';
import type { SatRec } from '../Satellites/types';

const ListCard = memo(
    ({name, satnum}: SatRec) => 
        <div>
            {name} ({satnum})
        </div>
);

function RowComponent({
    index,
    filtered,
    selectSatellite,
    style,
}: RowComponentProps<{
    filtered: SatRec[];
    selectSatellite: (arg0:number, arg1:{x: number, y: number, z:number}) => void;
}>) {
    const e = filtered[index];

    return (
        <div style={style}>
            <span 
                className="clickable"
                onClick={() => selectSatellite(index, {x: 0, y: 0, z: 0})}
            >
                <ListCard {...e} />
            </span>
        </div>
    );
}

export default function SatList() {
    const { data: satDetails, isLoading, isError } = use3leQuery();
    const selectSatellite = useSelectedStore(s => s.select);
    const search = useFilterStore(s => s.search);
    const search_lower = useMemo(() => search.toLocaleLowerCase(), [search]);

    const filtered = useMemo<SatRec[]>(() => {
        if (!satDetails) { return []; }

        return satDetails.filter((e: SatRec) => e.name.toLocaleLowerCase().includes(search_lower));
    }, [satDetails, search_lower]);

    if (isLoading || isError || filtered.length == 0) { return; }

    return (<>
        <div className="flex-col list">
            <List 
                rowCount={filtered.length}
                rowHeight={18}
                rowComponent={RowComponent}
                rowProps={{
                    filtered,
                    selectSatellite,
                }}
            >
            </List>
        </div>
    </>);
}
