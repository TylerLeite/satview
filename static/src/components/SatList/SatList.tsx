import './SatList.css';

import { useMemo, memo } from 'react';

import { useSelectedStore } from '../../stores/selected';
import { useFilterStore } from '../../stores/filter';

import use3leQuery from '../../queries/sat3le';

import type { SatRec } from '../Satellites/types';
import { useSplosionStore } from '../../stores/splosion';

type ListCardProps = {
    name: string;
    satnum: string;
    isSploded: boolean;
    idx: number;
    selectSatellite: (arg0: number, arg1: {x: number, y: number, z: number}) => void;
}
const ListCard = memo(
    ({name, satnum, isSploded, idx, selectSatellite}: ListCardProps) => 
        <span
            className="clickable"
            style={{ color: isSploded ? "#999" : "#FFF" }}
            onClick={() => selectSatellite(idx, { x: 0, y: 0, z: 0 })}
        >
            <div>{name} ({satnum})</div>
        </span>
);

export default function SatList() {
    const { data: satDetails, isLoading, isError } = use3leQuery();
    const selectSatellite = useSelectedStore(s => s.select);
    const search = useFilterStore(s => s.search);

    const splodedSatellites = useSplosionStore(s => s.splodedSatellites_rev);

    const listItems = useMemo(() => {
        function isSploded(satnum: string) {
            return splodedSatellites.has(satnum);
        }

        if (!satDetails) { return null; }

        return satDetails.map((e: SatRec, idx: number) =>  {
            if (!e.name.includes(search)) { return null; }

            return(
                <ListCard 
                    name={e.name}
                    satnum={e.satnum}
                    isSploded={isSploded(e.satnum)}
                    idx={idx}
                    selectSatellite={selectSatellite}
                />
            );
        });
    }, [satDetails, search, selectSatellite, splodedSatellites]);

    if (isLoading || isError ) { return; }


    return (<>
        <div className="flex-col list">
            { listItems }
        </div>
    </>);
}
